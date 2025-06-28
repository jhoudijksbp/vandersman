import json
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext
from lambda_code.functions.rompslomp_integrator.rompslomp_api import get_access_token, fetch_relaties

logger = Logger(service="rompslomp")


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict, context: LambdaContext):
    code = event.get("queryStringParameters", {}).get("code")

    if not code:
        logger.warning("Missing 'code' in query parameters")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing authorization code"})
        }

    try:
        access_token = get_access_token(code)
        relaties = fetch_relaties(access_token)
    except Exception as e:
        logger.exception("Error during Rompslomp integration flow")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

    return {
        "statusCode": 200,
        "body": json.dumps({"relaties": relaties})
    }
