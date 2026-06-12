"""Product service with business logic."""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Product
from app.schemas import ProductCreate, ProductUpdate
from app.core.exceptions import (
    ResourceNotFoundError,
    DuplicateResourceError,
    InternalServerError,
)


class ProductService:
    """Service for product operations."""
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """
        Create a new product.
        
        Args:
            db: Database session
            product_data: Product creation data
            
        Returns:
            Created product
            
        Raises:
            DuplicateResourceError: If SKU already exists
            InternalServerError: For other database errors
        """
        try:
            product = Product(**product_data.model_dump())
            db.add(product)
            db.commit()
            db.refresh(product)
            return product
        except IntegrityError as e:
            db.rollback()
            if "sku" in str(e).lower():
                raise DuplicateResourceError(f"Product with SKU '{product_data.sku}' already exists")
            raise InternalServerError(f"Database error: {str(e)}")
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to create product: {str(e)}")
    
    @staticmethod
    def get_products(db: Session, skip: int = 0, limit: int = 100) -> list[Product]:
        """
        Get all products with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of products
        """
        return db.query(Product).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Product:
        """
        Get a product by ID.
        
        Args:
            db: Database session
            product_id: Product ID
            
        Returns:
            Product object
            
        Raises:
            ResourceNotFoundError: If product not found
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ResourceNotFoundError(f"Product with ID {product_id} not found")
        return product
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Product:
        """
        Update a product.
        
        Args:
            db: Database session
            product_id: Product ID
            product_data: Updated product data
            
        Returns:
            Updated product
            
        Raises:
            ResourceNotFoundError: If product not found
            DuplicateResourceError: If new SKU conflicts
        """
        product = ProductService.get_product(db, product_id)
        
        update_data = product_data.model_dump(exclude_unset=True)
        if not update_data:
            return product
        
        try:
            for key, value in update_data.items():
                setattr(product, key, value)
            db.commit()
            db.refresh(product)
            return product
        except IntegrityError as e:
            db.rollback()
            if "sku" in str(e).lower():
                raise DuplicateResourceError(f"Product with SKU '{product_data.sku}' already exists")
            raise InternalServerError(f"Database error: {str(e)}")
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to update product: {str(e)}")
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> dict:
        """
        Delete a product.
        
        Args:
            db: Database session
            product_id: Product ID
            
        Returns:
            Success message
            
        Raises:
            ResourceNotFoundError: If product not found
        """
        product = ProductService.get_product(db, product_id)
        
        try:
            db.delete(product)
            db.commit()
            return {"message": f"Product with ID {product_id} deleted successfully"}
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to delete product: {str(e)}")
