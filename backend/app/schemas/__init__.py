"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from datetime import datetime
from typing import List, Optional


# ============= PRODUCT SCHEMAS =============


class ProductBase(BaseModel):
    """Base product schema."""
    
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    
    @field_validator("name", "sku")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        """Strip leading/trailing whitespace."""
        return v.strip()


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    
    @field_validator("name", "sku")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        """Strip leading/trailing whitespace."""
        if v is not None:
            return v.strip()
        return v


class ProductResponse(ProductBase):
    """Schema for product response."""
    
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# ============= CUSTOMER SCHEMAS =============


class CustomerBase(BaseModel):
    """Base customer schema."""
    
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=1, max_length=20)
    
    @field_validator("full_name", "phone_number")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        """Strip leading/trailing whitespace."""
        return v.strip()


class CustomerCreate(CustomerBase):
    """Schema for creating a customer."""
    pass


class CustomerResponse(CustomerBase):
    """Schema for customer response."""
    
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


# ============= ORDER ITEM SCHEMAS =============


class OrderItemBase(BaseModel):
    """Base order item schema."""
    
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    """Schema for creating an order item."""
    pass


class OrderItemResponse(OrderItemBase):
    """Schema for order item response."""
    
    id: int
    order_id: int
    unit_price: float
    
    model_config = {"from_attributes": True}


# ============= ORDER SCHEMAS =============


class OrderItemInCreate(BaseModel):
    """Schema for order item in order creation request."""
    
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemInCreate] = Field(..., min_length=1)
    
    @model_validator(mode="after")
    def validate_items(self):
        """Validate items."""
        if not self.items:
            raise ValueError("Order must contain at least one item")
        return self


class OrderResponse(BaseModel):
    """Schema for order response."""
    
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    
    model_config = {"from_attributes": True}


class OrderDetailResponse(OrderResponse):
    """Schema for detailed order response with items and customer."""
    
    customer: CustomerResponse
    order_items: List[OrderItemResponse]


# ============= HEALTH CHECK =============


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""
    
    status: str
