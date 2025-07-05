
import os
import json
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext

from lambda_code.models.contact_model import ContactModel
from lambda_code.models.product_model import ProductModel
from lambda_code.common.s3_writer import write_json_to_s3
from lambda_code.functions.rompslomp_integrator.rompslomp_api import (
    get_access_token,
    fetch_company,
    fetch_all_customers_by_company,
    fetch_all_products_by_company,
)

logger = Logger(service="rompslomp")

S3_BUCKET = os.environ.get("ROMPSLOMP_S3_BUCKET")
if not S3_BUCKET:
    raise EnvironmentError("Missing required environment variable: ROMPSLOMP_S3_BUCKET")


def fetch_and_transform_contacts(access_token: str, company: dict) -> list[dict]:
    raw_contacts = fetch_all_customers_by_company(access_token, company)
    return [
        ContactModel(
            id=c["id"],
            email=c.get("email"),
            is_individual=c.get("is_individual", False),
            contact_person_name=c.get("contact_person_name"),
            company_name=c.get("company_name"),
        ).to_dict()
        for c in raw_contacts if c.get("id")
    ]


def fetch_and_transform_products(access_token: str, company: dict) -> list[dict]:
    raw_products = fetch_all_products_by_company(access_token, company)
    return [
        ProductModel.from_api_dict(p).to_dict()
        for p in raw_products
    ]


def store_data_to_s3(contacts: list[dict], products: list[dict]) -> tuple[str, str]:
    contacts_key = write_json_to_s3(contacts, S3_BUCKET, "rompslomp_contacts")
    products_key = write_json_to_s3(products, S3_BUCKET, "rompslomp_products")
    return contacts_key, products_key


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    try:
        access_token = get_access_token()
        company = fetch_company(access_token)

        contacts = fetch_and_transform_contacts(access_token, company)
        products = fetch_and_transform_products(access_token, company)

        # store results to S3
        contacts_key, products_key = store_data_to_s3(contacts, products)

        return {
            "status": "OK",
            "message": "Rompslomp integrator executed successfully"
        }

    except Exception as e:
        logger.exception(f"Error during Rompslomp integration flow: {str(e)}")
        return {
            "status": "FAILED",
            "message": "Rompslomp integrator FAILED"
        }