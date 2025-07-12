import json
from datetime import datetime, timedelta
from aws_lambda_powertools import Logger
from lambda_code.models.invoice import InvoiceLine, SalesInvoice
from lambda_code.models.werkbon import WerkbonModel
from lambda_code.functions.rompslomp_integrator.rompslomp_api import (
    get_access_token,
    fetch_company,
    create_sales_invoice,
)

logger = Logger()


def parse_id_datum_pairs(event: dict) -> list[tuple[str, str]]:
    ids = event.get("arguments", {}).get("ids", [])
    if not ids:
        raise ValueError("No IDs provided")

    try:
        return [
            (item["id"], item["datum"])
            for item in ids
            if isinstance(item, dict) and "id" in item and "datum" in item
        ]
    except Exception as e:
        raise ValueError(f"Ongeldige inputstructuur: {str(e)}")


def werkbonnen_to_invoice_payload(werkbonnen: list[dict], default_tarief_per_uur: float = 15.0) -> dict:
    if not werkbonnen:
        raise ValueError("Geen werkbonnen aangeleverd")

    all_lines = []
    klant_ids = set()
    dates = []

    for wb in werkbonnen:
        klant_ids.add(wb["klant_id"])
        dates.append(wb["datumOpdracht"])

        for product in wb.get("products", []):
            all_lines.append(
                InvoiceLine(
                    description=product["name"],
                    price_per_unit=str(product["price"]),
                    quantity=str(product["quantity"]),
                    product_id=int(product["id"]),
                )
            )

        for service in wb.get("services", []):
            all_lines.append(
                InvoiceLine(
                    description=service["name"],
                    price_per_unit=str(default_tarief_per_uur),
                    quantity=str(service["hours"]),
                )
            )

    if len(klant_ids) != 1:
        raise ValueError(f"Meerdere klant_ids gevonden: {klant_ids}")

    date = max(datetime.fromisoformat(d) for d in dates)
    due_date = (date + timedelta(days=30)).date().isoformat()

    invoice = SalesInvoice(
        date=date.date().isoformat(),
        due_date=due_date,
        contact_id=int(werkbonnen[0]["klant_id"]),
        template_id=633746088,
        invoice_lines=all_lines,
    )

    return invoice.to_payload()

def update_werkbonnen_with_invoice_id(id_datum_pairs: list[tuple[str, str]], invoice_id: str) -> None:
    for werkbon_id, datum in id_datum_pairs:
        try:
            werkbon = WerkbonModel.get(werkbon_id, datum)
            werkbon.update(actions=[WerkbonModel.invoice_id.set(invoice_id)])
            logger.info(f"Factuur-ID {invoice_id} opgeslagen in werkbon {werkbon_id}")
        except Exception as e:
            logger.exception(f"Fout bij opslaan van invoice_id in werkbon {werkbon_id}")
            raise RuntimeError(f"Werkbon-update mislukt voor {werkbon_id}: {e}")

@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    logger.info("Start aanmaken Rompslomp-factuur")

    try:
        id_datum_pairs = parse_id_datum_pairs(event)
        werkbon_data = WerkbonModel.get_by_ids(id_datum_pairs)
        payload = werkbonnen_to_invoice_payload(werkbon_data)

        access_token = get_access_token()
        company = fetch_company(access_token)
        result = create_sales_invoice(access_token, company["id"], payload)

        invoice_id = str(result["sales_invoice"]["id"])
        update_werkbonnen_with_invoice_id(id_datum_pairs, invoice_id)

        return {
            "status": "200",
            "message": f"Factuur {invoice_id} succesvol aangemaakt en gekoppeld aan {len(id_datum_pairs)} werkbonnen"
        }

    except ValueError as e:
        logger.warning(str(e))
        return {"status": "400", "message": str(e)}

    except Exception as e:
        logger.exception("Onverwachte fout in lambda_handler")
        return {"status": "500", "message": str(e)}
