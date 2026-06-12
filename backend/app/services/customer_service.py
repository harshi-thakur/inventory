"""Customer service with business logic."""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Customer
from app.schemas import CustomerCreate
from app.core.exceptions import (
    ResourceNotFoundError,
    DuplicateResourceError,
    InternalServerError,
)


class CustomerService:
    """Service for customer operations."""
    
    @staticmethod
    def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
        """
        Create a new customer.
        
        Args:
            db: Database session
            customer_data: Customer creation data
            
        Returns:
            Created customer
            
        Raises:
            DuplicateResourceError: If email already exists
            InternalServerError: For other database errors
        """
        try:
            customer = Customer(**customer_data.model_dump())
            db.add(customer)
            db.commit()
            db.refresh(customer)
            return customer
        except IntegrityError as e:
            db.rollback()
            if "email" in str(e).lower():
                raise DuplicateResourceError(f"Customer with email '{customer_data.email}' already exists")
            raise InternalServerError(f"Database error: {str(e)}")
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to create customer: {str(e)}")
    
    @staticmethod
    def get_customers(db: Session, skip: int = 0, limit: int = 100) -> list[Customer]:
        """
        Get all customers with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of customers
        """
        return db.query(Customer).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Customer:
        """
        Get a customer by ID.
        
        Args:
            db: Database session
            customer_id: Customer ID
            
        Returns:
            Customer object
            
        Raises:
            ResourceNotFoundError: If customer not found
        """
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise ResourceNotFoundError(f"Customer with ID {customer_id} not found")
        return customer
    
    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> dict:
        """
        Delete a customer.
        
        Args:
            db: Database session
            customer_id: Customer ID
            
        Returns:
            Success message
            
        Raises:
            ResourceNotFoundError: If customer not found
        """
        customer = CustomerService.get_customer(db, customer_id)
        
        try:
            db.delete(customer)
            db.commit()
            return {"message": f"Customer with ID {customer_id} deleted successfully"}
        except Exception as e:
            db.rollback()
            raise InternalServerError(f"Failed to delete customer: {str(e)}")
