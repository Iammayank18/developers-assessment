import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Record(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: str = Field(index=True)  # "worklog", "segment", "payment"
    parent_id: Optional[uuid.UUID] = Field(default=None, index=True, foreign_key="record.id")
    data: str = Field(default="{}")  # JSON blob with type-specific fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
