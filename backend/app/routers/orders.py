"""Order router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderDetailResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Create a new order with items. Automatically reduces product stock."
)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new order.
    
    - Validates customer exists
    - Validates all products exist
    - Checks stock availability
    - Calculates total amount automatically
    - Reduces inventory
    - Uses database transaction for consistency
    """
    return OrderService.create_order(db, order)


@router.get(
    "",
    response_model=list[OrderResponse],
    summary="Get all orders",
    description="Retrieve all orders with pagination"
)
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all orders with pagination."""
    return OrderService.get_orders(db, skip=skip, limit=limit)


@router.get(
    "/{order_id}",
    response_model=OrderDetailResponse,
    summary="Get order details",
    description="Retrieve a single order with customer and items"
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Get order details with customer and items."""
    return OrderService.get_order(db, order_id)


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an order",
    description="Delete an order and restore product stock"
)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Delete an order and restore inventory."""
    OrderService.delete_order(db, order_id)
