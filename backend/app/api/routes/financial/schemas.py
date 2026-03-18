import re
import uuid
from typing import Optional

from pydantic import BaseModel, field_validator


class SegmentResponse(BaseModel):
    id: uuid.UUID
    start_time: str
    end_time: str
    hours: float
    description: str

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: uuid.UUID) -> uuid.UUID:
        if value is None:
            raise ValueError("id is required")
        return value

    @field_validator("start_time")
    @classmethod
    def validate_start_time(cls, value: str) -> str:
        if value is None:
            raise ValueError("start_time is required")
        if not isinstance(value, str):
            raise ValueError("start_time must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("start_time cannot be empty")
        return value

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, value: str) -> str:
        if value is None:
            raise ValueError("end_time is required")
        if not isinstance(value, str):
            raise ValueError("end_time must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("end_time cannot be empty")
        return value

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, value: float) -> float:
        if value is None:
            raise ValueError("hours is required")
        if not isinstance(value, (int, float)):
            raise ValueError("hours must be a number")
        if value < 0:
            raise ValueError("hours cannot be negative")
        return float(value)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        if value is None:
            raise ValueError("description is required")
        if not isinstance(value, str):
            raise ValueError("description must be a string")
        return value.strip()


class WorklogResponse(BaseModel):
    id: uuid.UUID
    task_name: str
    freelancer_name: str
    freelancer_email: str
    hourly_rate: float
    status: str
    description: str
    total_hours: float
    total_earned: float
    created_at: str

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: uuid.UUID) -> uuid.UUID:
        if value is None:
            raise ValueError("id is required")
        return value

    @field_validator("task_name")
    @classmethod
    def validate_task_name(cls, value: str) -> str:
        if value is None:
            raise ValueError("task_name is required")
        if not isinstance(value, str):
            raise ValueError("task_name must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("task_name cannot be empty")
        if len(value) > 255:
            raise ValueError("task_name too long")
        return value

    @field_validator("freelancer_name")
    @classmethod
    def validate_freelancer_name(cls, value: str) -> str:
        if value is None:
            raise ValueError("freelancer_name is required")
        if not isinstance(value, str):
            raise ValueError("freelancer_name must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("freelancer_name cannot be empty")
        if len(value) > 255:
            raise ValueError("freelancer_name too long")
        return value

    @field_validator("freelancer_email")
    @classmethod
    def validate_freelancer_email(cls, value: str) -> str:
        if value is None:
            raise ValueError("freelancer_email is required")
        if not isinstance(value, str):
            raise ValueError("freelancer_email must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("freelancer_email cannot be empty")
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", value):
            raise ValueError("freelancer_email is invalid")
        return value

    @field_validator("hourly_rate")
    @classmethod
    def validate_hourly_rate(cls, value: float) -> float:
        if value is None:
            raise ValueError("hourly_rate is required")
        if not isinstance(value, (int, float)):
            raise ValueError("hourly_rate must be a number")
        if value < 0:
            raise ValueError("hourly_rate cannot be negative")
        return float(value)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value is None:
            raise ValueError("status is required")
        if not isinstance(value, str):
            raise ValueError("status must be a string")
        value = value.strip()
        if value not in ("pending", "paid"):
            raise ValueError("status must be pending or paid")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        if value is None:
            raise ValueError("description is required")
        if not isinstance(value, str):
            raise ValueError("description must be a string")
        return value.strip()

    @field_validator("total_hours")
    @classmethod
    def validate_total_hours(cls, value: float) -> float:
        if value is None:
            raise ValueError("total_hours is required")
        if not isinstance(value, (int, float)):
            raise ValueError("total_hours must be a number")
        return float(value)

    @field_validator("total_earned")
    @classmethod
    def validate_total_earned(cls, value: float) -> float:
        if value is None:
            raise ValueError("total_earned is required")
        if not isinstance(value, (int, float)):
            raise ValueError("total_earned must be a number")
        return float(value)

    @field_validator("created_at")
    @classmethod
    def validate_created_at(cls, value: str) -> str:
        if value is None:
            raise ValueError("created_at is required")
        if not isinstance(value, str):
            raise ValueError("created_at must be a string")
        return value.strip()


class WorklogsListResponse(BaseModel):
    data: list[WorklogResponse]
    count: int

    @field_validator("data")
    @classmethod
    def validate_data(cls, value: list) -> list:
        if value is None:
            raise ValueError("data is required")
        if not isinstance(value, list):
            raise ValueError("data must be a list")
        return value

    @field_validator("count")
    @classmethod
    def validate_count(cls, value: int) -> int:
        if value is None:
            raise ValueError("count is required")
        if not isinstance(value, int):
            raise ValueError("count must be an integer")
        if value < 0:
            raise ValueError("count cannot be negative")
        return value


class WorklogDetailResponse(BaseModel):
    id: uuid.UUID
    task_name: str
    freelancer_name: str
    freelancer_email: str
    hourly_rate: float
    status: str
    description: str
    total_hours: float
    total_earned: float
    created_at: str
    segments: list[SegmentResponse]

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: uuid.UUID) -> uuid.UUID:
        if value is None:
            raise ValueError("id is required")
        return value

    @field_validator("task_name")
    @classmethod
    def validate_task_name(cls, value: str) -> str:
        if value is None:
            raise ValueError("task_name is required")
        if not isinstance(value, str):
            raise ValueError("task_name must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("task_name cannot be empty")
        return value

    @field_validator("freelancer_name")
    @classmethod
    def validate_freelancer_name(cls, value: str) -> str:
        if value is None:
            raise ValueError("freelancer_name is required")
        if not isinstance(value, str):
            raise ValueError("freelancer_name must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("freelancer_name cannot be empty")
        return value

    @field_validator("freelancer_email")
    @classmethod
    def validate_freelancer_email(cls, value: str) -> str:
        if value is None:
            raise ValueError("freelancer_email is required")
        if not isinstance(value, str):
            raise ValueError("freelancer_email must be a string")
        value = value.strip()
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", value):
            raise ValueError("freelancer_email is invalid")
        return value

    @field_validator("hourly_rate")
    @classmethod
    def validate_hourly_rate(cls, value: float) -> float:
        if value is None:
            raise ValueError("hourly_rate is required")
        if not isinstance(value, (int, float)):
            raise ValueError("hourly_rate must be a number")
        if value < 0:
            raise ValueError("hourly_rate cannot be negative")
        return float(value)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value is None:
            raise ValueError("status is required")
        if not isinstance(value, str):
            raise ValueError("status must be a string")
        value = value.strip()
        if value not in ("pending", "paid"):
            raise ValueError("status must be pending or paid")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        if value is None:
            raise ValueError("description is required")
        if not isinstance(value, str):
            raise ValueError("description must be a string")
        return value.strip()

    @field_validator("total_hours")
    @classmethod
    def validate_total_hours(cls, value: float) -> float:
        if value is None:
            raise ValueError("total_hours is required")
        return float(value)

    @field_validator("total_earned")
    @classmethod
    def validate_total_earned(cls, value: float) -> float:
        if value is None:
            raise ValueError("total_earned is required")
        return float(value)

    @field_validator("created_at")
    @classmethod
    def validate_created_at(cls, value: str) -> str:
        if value is None:
            raise ValueError("created_at is required")
        return value.strip()

    @field_validator("segments")
    @classmethod
    def validate_segments(cls, value: list) -> list:
        if value is None:
            raise ValueError("segments is required")
        if not isinstance(value, list):
            raise ValueError("segments must be a list")
        return value


class PaymentCreate(BaseModel):
    wl_ids: list[uuid.UUID]
    notes: Optional[str] = ""

    @field_validator("wl_ids")
    @classmethod
    def validate_wl_ids(cls, value: list) -> list:
        if value is None:
            raise ValueError("wl_ids is required")
        if not isinstance(value, list):
            raise ValueError("wl_ids must be a list")
        if len(value) == 0:
            raise ValueError("wl_ids cannot be empty")
        return value

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: Optional[str]) -> str:
        if value is None:
            return ""
        if not isinstance(value, str):
            raise ValueError("notes must be a string")
        return value.strip()


class PaymentResponse(BaseModel):
    id: uuid.UUID
    total_amount: float
    status: str
    paid_at: str
    notes: str
    created_at: str
    worklog_ids: list[uuid.UUID]

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: uuid.UUID) -> uuid.UUID:
        if value is None:
            raise ValueError("id is required")
        return value

    @field_validator("total_amount")
    @classmethod
    def validate_total_amount(cls, value: float) -> float:
        if value is None:
            raise ValueError("total_amount is required")
        if not isinstance(value, (int, float)):
            raise ValueError("total_amount must be a number")
        return float(value)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value is None:
            raise ValueError("status is required")
        if not isinstance(value, str):
            raise ValueError("status must be a string")
        value = value.strip()
        if len(value) == 0:
            raise ValueError("status cannot be empty")
        return value

    @field_validator("paid_at")
    @classmethod
    def validate_paid_at(cls, value: str) -> str:
        if value is None:
            raise ValueError("paid_at is required")
        if not isinstance(value, str):
            raise ValueError("paid_at must be a string")
        return value.strip()

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: str) -> str:
        if value is None:
            return ""
        if not isinstance(value, str):
            raise ValueError("notes must be a string")
        return value.strip()

    @field_validator("created_at")
    @classmethod
    def validate_created_at(cls, value: str) -> str:
        if value is None:
            raise ValueError("created_at is required")
        return value.strip()

    @field_validator("worklog_ids")
    @classmethod
    def validate_worklog_ids(cls, value: list) -> list:
        if value is None:
            raise ValueError("worklog_ids is required")
        if not isinstance(value, list):
            raise ValueError("worklog_ids must be a list")
        return value


class PaymentsListResponse(BaseModel):
    data: list[PaymentResponse]
    count: int

    @field_validator("data")
    @classmethod
    def validate_data(cls, value: list) -> list:
        if value is None:
            raise ValueError("data is required")
        if not isinstance(value, list):
            raise ValueError("data must be a list")
        return value

    @field_validator("count")
    @classmethod
    def validate_count(cls, value: int) -> int:
        if value is None:
            raise ValueError("count is required")
        if not isinstance(value, int):
            raise ValueError("count must be an integer")
        if value < 0:
            raise ValueError("count cannot be negative")
        return value
