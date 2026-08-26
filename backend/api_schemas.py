from typing import Annotated, Optional

from pydantic import BaseModel, Field, field_validator


MAX_CHAT_MESSAGE_LENGTH = 1_000
MAX_CHAT_CANDIDATES = 100
MAX_CHAT_CANDIDATE_ID = 2_147_483_647

CandidateId = Annotated[
    int,
    Field(strict=True, ge=1, le=MAX_CHAT_CANDIDATE_ID),
]


class PeticionChat(BaseModel):
    mensaje: str = Field(min_length=1, max_length=MAX_CHAT_MESSAGE_LENGTH)
    candidate_ids: Optional[list[CandidateId]] = Field(default=None, max_length=MAX_CHAT_CANDIDATES)

    @field_validator("mensaje")
    @classmethod
    def normalizar_mensaje(cls, value: str) -> str:
        mensaje = value.strip()
        if not mensaje:
            raise ValueError("El mensaje no puede estar vacio.")
        return mensaje
