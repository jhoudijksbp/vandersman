from dataclasses import dataclass


@dataclass
class ProductModel:
    id: int
    invoice_line_id: int
    desc: str
    price_with_vat: float
    price_without_vat: float
    vat_amount: float
    vat_rate: float

    @staticmethod
    def from_api_dict(data: dict) -> "ProductModel":
        if "invoice_line" not in data or not isinstance(data["invoice_line"], dict):
            raise ValueError(f"Missing or invalid invoice_line for product ID {data.get('id')}")

        line = data["invoice_line"]

        return ProductModel(
            id=data["id"],
            invoice_line_id=line["id"],
            desc=line.get("description", ""),
            price_with_vat=float(line.get("price_with_vat") or 0.0),
            price_without_vat=float(line.get("price_without_vat") or 0.0),
            vat_amount=float(line.get("vat_amount") or 0.0),
            vat_rate=float(line.get("vat_rate") or 0.0),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "invoice_line_id": self.invoice_line_id,
            "desc": self.desc,
            "price_with_vat": self.price_with_vat,
            "price_without_vat": self.price_without_vat,
            "vat_amount": self.vat_amount,
            "vat_rate": self.vat_rate,
        }
