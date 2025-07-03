import os
import json
from aws_lambda_powertools import Logger
from utils import fetch_cognito_users, upload_to_s3

logger = Logger()
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
S3_KEY = os.environ.get("S3_KEY", "medewerkers.json")

@logger.inject_lambda_context
def lambda_handler(event, context):
    users = fetch_cognito_users(USER_POOL_ID)
    logger.info(f"Totaal aantal medewerkers gevonden: {len(users)}")

    upload_to_s3(users, S3_BUCKET_NAME, S3_KEY)
    logger.info(f"Gegevens opgeslagen in S3: s3://{S3_BUCKET_NAME}/{S3_KEY}")

    return {
        "statusCode": 200,
        "body": json.dumps(users)
    }
