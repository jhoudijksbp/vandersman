from dataclasses import dataclass, field


@dataclass
class ContactModel:
    id: int
    name: str = field(init=False)
    email: str | None = None
    is_individual: bool = False
    contact_person_name: str | None = None
    company_name: str | None = None

    def __post_init__(self):
        self.name = self.contact_person_name if self.is_individual else self.company_name or "Onbekend"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }
