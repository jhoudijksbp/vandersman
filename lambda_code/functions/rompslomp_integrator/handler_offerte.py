
import json
from datetime import datetime, timedelta
from aws_lambda_powertools import Logger
from lambda_code.models.invoice import InvoiceLine, SalesInvoice
from lambda_code.models.werkbon import WerkbonModel
from lambda_code.functions.rompslomp_integrator.rompslomp_api import get_access_token, fetch_company, create_sales_invoice

logger = Logger()

def werkbonnen_to_invoice_payload(werkbonnen: list[dict], default_tarief_per_uur: float = 15.0) -> dict:
    if not werkbonnen:
        raise ValueError("Geen werkbonnen aangeleverd")

    # Verzamelen
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

@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    id_datum_pairs = event.get("ids", [])
    if not id_datum_pairs:
        return {"statusCode": 400, "body": "No IDs provided"}

    werkbon_data = WerkbonModel.get_by_ids(id_datum_pairs)

    try:
        payload = werkbonnen_to_invoice_payload(werkbon_data)
    except ValueError as e:
        logger.error(f"Factuurgeneratie mislukt: {e}")
        return {"statusCode": 400, "body": str(e)}

    access_token = get_access_token()
    company = fetch_company(access_token)
    logger.info(json.dumps(payload, indent=4))
    result = create_sales_invoice(access_token, company["id"], payload)
    logger.info(result)
    return {
        "statusCode": 200,
        "body": result,
    }