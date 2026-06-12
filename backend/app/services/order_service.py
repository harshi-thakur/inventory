"""Order service with business logic."""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderItemInCreate
from app.core.exceptions import (
    ResourceNotFoundError,
    InsufficientStockError,
    InternalServerError,
)


class OrderService:
    """Service for order operations."""
    
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Order:
        """
        Create a new order with items and handle inventory.
        
        Uses database transaction to ensure atomicity:
        1. Validate customer exists
        2. Validate all products exist
        3. Check stock availability
        4. Calculate total amount
        5. Reduce inventory
        6. Create order and items
        7. Commit transaction or rollback on any failure
        
        Args:
            db: Database session
            order_data: Order creation data
            
        Returns:
            Created order with items
            
        Raises:
            ResourceNotFoundError: If customer or product not found
            InsufficientStockError: If product stock is insufficient
            InternalServerError: For database errors
        """
        try:
            # Step 1: Validate customer exists
            customer = db.query(Customer).filter(
                Customer.id == order_data.customer_id
            ).first()
            if not customer:
                raise ResourceNotFoundError(
                    f"Customer with ID {order_data.customer_id} not found"
                )
            
            # Step 2 & 3: Validate products and check stock
            products_map = {}  # Store product data for efficiency
            total_amount = 0.0
            
            for item in order_data.items:
                product = db.query(Product).filter(
                    Product.id == item.product_id
                ).first()
                
                if not product:
                    raise ResourceNotFoundError(
                        f"Product with ID {item.product_id} not found"
                    )
                
                # Check stock availability
                if product.stock_quantity < item.quantity:
                    raise InsufficientStockError(
                        product_name=product.name,
                        requested=item.quantity,
                        available=product.stock_quantity
                    )
                
                # Calculate total amount
                total_amount += product.price * item.quantity
                
                # Store for later use
                products_map[item.product_id] = {
                    "product": product,
                    "unit_price": product.price,
                    "quantity": item.quantity
                }
            
            # Step 4 & 5: Create order and reduce inventory
            order = Order(
                customer_id=order_data.customer_id,
                total_amount=total_amount
            )
            db.add(order)
            db.flush()  # Flush to get the order ID without committing
            
            # Step 6: Create order items and reduce stock
            for item in order_data.items:
                product_info = products_map[item.product_id]
                
                # Reduce inventory
                product_info["product"].stock_quantity -= item.quantity
                
                # Create order item
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    unit_price=product_info["unit_price"]
                )
                db.add(order_item)
            
            # Step 7: Commit transaction
            db.commit()
            db.refresh(order)
            return order
            
        except (ResourceNotFoundError, InsufficientStockError):
            db.rollback()
            raise
        except IntegrityError as e:
            db.rollback()
            raise InternalServerError(f"Database integrity error: {str(e)}")
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to create order: {str(e)}")
    
    @staticmethod
    def get_orders(db: Session, skip: int = 0, limit: int = 100) -> list[Order]:
        """
        Get all orders with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of orders
        """
        return db.query(Order).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_order(db: Session, order_id: int) -> Order:
        """
        Get an order by ID with relationships.
        
        Args:
            db: Database session
            order_id: Order ID
            
        Returns:
            Order object with customer and items
            
        Raises:
            ResourceNotFoundError: If order not found
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ResourceNotFoundError(f"Order with ID {order_id} not found")
        return order
    
    @staticmethod
    def delete_order(db: Session, order_id: int) -> dict:
        """
        Delete an order and restore inventory.
        
        Args:
            db: Database session
            order_id: Order ID
            
        Returns:
            Success message
            
        Raises:
            ResourceNotFoundError: If order not found
        """
        order = OrderService.get_order(db, order_id)
        
        try:
            # Restore inventory for all items in the order
            for order_item in order.order_items:
                product = db.query(Product).filter(
                    Product.id == order_item.product_id
                ).first()
                if product:
                    product.stock_quantity += order_item.quantity
            
            db.delete(order)
            db.commit()
            return {"message": f"Order with ID {order_id} deleted successfully"}
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to delete order: {str(e)}")
