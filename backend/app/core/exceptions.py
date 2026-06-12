"""Custom exceptions."""
from fastapi import HTTPException, status


class ResourceNotFoundError(HTTPException):
    """Raised when a resource is not found."""
    
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message
        )


class DuplicateResourceError(HTTPException):
    """Raised when trying to create a duplicate resource."""
    
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message
        )


class InsufficientStockError(HTTPException):
    """Raised when product stock is insufficient."""
    
    def __init__(self, product_name: str, requested: int, available: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient stock for {product_name}. Requested: {requested}, Available: {available}"
        )


class ValidationError(HTTPException):
    """Raised when validation fails."""
    
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message
        )


class InternalServerError(HTTPException):
    """Raised for internal server errors."""
    
    def __init__(self, message: str = "Internal server error"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=message
        )
