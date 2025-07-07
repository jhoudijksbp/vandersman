from dataclasses import dataclass
from typing import Optional


@dataclass
class InvoiceLine:
    description: str
    price_per_unit: str  # Rompslomp verwacht strings
    quantity: str
    product_id: Optional[int] = None
    extended_description: Optional[str] = None


@dataclass
class SalesInvoice:
    date: str
    due_date: str
    contact_id: int
    template_id: int
    invoice_lines: list[InvoiceLine]
    payment_method: str = "pay_transfer"
    currency: str = "eur"
    currency_exchange_rate: str = "1.0"
    description: Optional[str] = None
    vat_number: str = ""
    api_reference: str = ""
    payment_reference: str = ""
    sale_type: str = ""
    distance_sale: bool = False

    def to_payload(self) -> dict:
        return {
            "sales_invoice": {
                "date": self.date,
                "due_date": self.due_date,
                "contact_id": self.contact_id,
                "template_id": self.template_id,
                "currency": self.currency,
                "currency_exchange_rate": self.currency_exchange_rate,
                "payment_method": self.payment_method,
                "description": self.description,
                "vat_number": self.vat_number,
                "api_reference": self.api_reference,
                "payment_reference": self.payment_reference,
                "sale_type": self.sale_type,
                "distance_sale": self.distance_sale,
                "invoice_lines": [
                    {
                        "description": line.description,
                        "extended_description": line.extended_description,
                        "price_per_unit": line.price_per_unit,
                        "quantity": line.quantity,
                        **({"product_id": line.product_id} if line.product_id else {}),
                    }
                    for line in self.invoice_lines
                ],
            }
        }
