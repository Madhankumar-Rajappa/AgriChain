from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.payment import PaymentStatus, PaymentMethod


class PaymentCreate(BaseModel):
    order_id: int = Field(..., examples=[1])
    payment_method: PaymentMethod = Field(default=PaymentMethod.MOCK_CARD, examples=["MOCK_CARD"])
    simulate_failure: bool = Field(default=False, description="Set true to simulate payment processing failure")


class PaymentOut(BaseModel):
    id: int
    order_id: int
    buyer_id: int
    amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_reference: str
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
