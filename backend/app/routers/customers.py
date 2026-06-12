"""Customer router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CustomerCreate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
    description="Create a new customer with unique email"
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """Create a new customer."""
    return CustomerService.create_customer(db, customer)


@router.get(
    "",
    response_model=list[CustomerResponse],
    summary="Get all customers",
    description="Retrieve all customers with pagination"
)
def get_customers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all customers with pagination."""
    return CustomerService.get_customers(db, skip=skip, limit=limit)


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer",
    description="Retrieve a single customer by ID"
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get a customer by ID."""
    return CustomerService.get_customer(db, customer_id)


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a customer",
    description="Delete a customer by ID"
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Delete a customer."""
    CustomerService.delete_customer(db, customer_id)
