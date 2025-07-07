import boto3
import requests
from aws_lambda_powertools import Logger

logger = Logger(service="rompslomp-api")

ROMPSLOMP_TOKEN_URL = "https://api.rompslomp.nl/oauth/token"
ROMPSLOMP_API_BASE = "https://api.rompslomp.nl/api/v1"

ssm = boto3.client("ssm")


def get_access_token() -> str:
    try:
        api_token = ssm.get_parameter(
            Name="/rompslomp/api_token",
            WithDecryption=True,
        )["Parameter"]["Value"]
        return api_token
    except Exception as e:
        logger.exception("Failed to fetch API token from SSM")
        raise RuntimeError(f"Missing or inaccessible API token: {e}")


def fetch_company(access_token: str) -> dict:
    url = f"{ROMPSLOMP_API_BASE}/companies"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    logger.info("Fetching company from Rompslomp")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        logger.error("Failed to fetch company", extra={"response": response.text})
        raise RuntimeError("API call to /companies failed")

    companies = response.json().get("companies", [])

    if not isinstance(companies, list) or len(companies) != 1:
        logger.error("Expected exactly 1 company", extra={"actual_count": len(companies)})
        raise RuntimeError("Expected exactly 1 company record")

    logger.info("Company fetched", extra={"company_id": companies[0]['id']})
    return companies[0]


def fetch_paginated_resource(access_token: str, company_id: int, resource: str, per_page: int = 40) -> list:
    all_items = []
    page = 1

    while True:
        url = (
            f"{ROMPSLOMP_API_BASE}/companies/{company_id}/{resource}"
            f"?selection=all&page={page}&per_page={per_page}"
        )
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }

        logger.info(f"Fetching {resource} page", extra={"page": page, "company_id": company_id})
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            logger.error(f"Failed to fetch {resource}", extra={"response": response.text})
            raise RuntimeError(f"API call to /{resource} failed")

        data = response.json()[resource]
        if not data:
            break

        all_items.extend(data)

        if len(data) < per_page:
            break

        page += 1

    logger.info(f"Total {resource} fetched: {len(all_items)}")
    return all_items

def fetch_all_customers_by_company(access_token: str, company: dict) -> list:
    return fetch_paginated_resource(access_token, company["id"], "contacts")

def fetch_all_products_by_company(access_token: str, company: dict) -> list:
    return fetch_paginated_resource(access_token, company["id"], "products")

def create_sales_invoice(access_token: str, company_id: int, invoice_payload: dict) -> dict:
    url = f"{ROMPSLOMP_API_BASE}/companies/{company_id}/sales_invoices"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    logger.info("Creating sales invoice")
    response = requests.post(url, headers=headers, json=invoice_payload)

    if response.status_code not in [200, 201]:
        logger.error("Failed to create sales invoice", extra={"response": response.text})
        raise RuntimeError("API call to create sales invoice failed")

    return response.json()
