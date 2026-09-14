from typing import Annotated, Optional

from pydantic import BaseModel, Field, field_validator


MAX_CHAT_MESSAGE_LENGTH = 1_000
MAX_CHAT_CANDIDATES = 100
MAX_CHAT_CANDIDATE_ID = 2_147_483_647

CandidateId = Annotated[
    int,
    Field(strict=True, ge=1, le=MAX_CHAT_CANDIDATE_ID),
]


MAX_USER_ID_LENGTH = 128


class PeticionChat(BaseModel):
    mensaje: str = Field(min_length=1, max_length=MAX_CHAT_MESSAGE_LENGTH)
    candidate_ids: Optional[list[CandidateId]] = Field(default=None, max_length=MAX_CHAT_CANDIDATES)
    user_id: Optional[str] = Field(default=None, max_length=MAX_USER_ID_LENGTH)

    @field_validator("mensaje")
    @classmethod
    def normalizar_mensaje(cls, value: str) -> str:
        mensaje = value.strip()
        if not mensaje:
            raise ValueError("El mensaje no puede estar vacio.")
        return mensaje

    @field_validator("user_id")
    @classmethod
    def normalizar_user_id(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        user_id = value.strip()
        return user_id or None


class PeticionLeadEvent(BaseModel):
    action: str = Field(min_length=1, max_length=32)
    property_ref: Optional[int] = Field(default=None, ge=1)
    operacion: Optional[str] = Field(default=None, max_length=80)
    zona: Optional[str] = Field(default=None, max_length=120)
    presupuesto: Optional[str] = Field(default=None, max_length=120)
    extra_filters: Optional[dict] = None
    plazo: Optional[str] = Field(default=None, max_length=40)
    session_id: Optional[str] = Field(default=None, max_length=MAX_USER_ID_LENGTH)
    user_id: Optional[str] = Field(default=None, max_length=MAX_USER_ID_LENGTH)

    @field_validator("action")
    @classmethod
    def normalizar_action(cls, value: str) -> str:
        action = value.strip().lower()
        if action not in {"contact_tap", "share"}:
            raise ValueError("action debe ser contact_tap o share.")
        return action

    @field_validator("operacion", "zona", "presupuesto", "plazo", "session_id", "user_id")
    @classmethod
    def strip_optional(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class PeticionMarcarContacto(BaseModel):
    search_log_id: Optional[int] = Field(default=None, ge=1)
    user_id: Optional[str] = Field(default=None, max_length=MAX_USER_ID_LENGTH)
    property_id: Optional[int] = Field(default=None, ge=1)

    @field_validator("user_id")
    @classmethod
    def normalizar_user_id(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        user_id = value.strip()
        return user_id or None
