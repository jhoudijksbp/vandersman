import os
import requests
from aws_lambda_powertools import Logger

logger = Logger(service="rompslomp-api")

ROMPSLOMP_TOKEN_URL = "https://api.rompslomp.nl/oauth/token"
ROMPSLOMP_API_BASE = "https://api.rompslomp.nl/api/v1"


def get_access_token(code: str) -> str:
    try:
        client_id = os.environ["CLIENT_ID"]
        client_secret = os.environ["CLIENT_SECRET"]
        redirect_uri = os.environ["REDIRECT_URI"]
    except KeyError as e:
        logger.exception("Missing required environment variable")
        raise RuntimeError(f"Missing environment variable: {e}")

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    logger.info("Requesting access token from Rompslomp")
    response = requests.post(ROMPSLOMP_TOKEN_URL, data=payload, headers=headers)

    if response.status_code != 200:
        logger.error(f"Token request failed: {response.text}")
        raise RuntimeError("Token exchange failed")

    return response.json().get("access_token")


def fetch_relaties(access_token: str) -> list:
    url = f"{ROMPSLOMP_API_BASE}/relaties"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    logger.info("Fetching relaties from Rompslomp API")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        logger.error(f"Failed to fetch relaties: {response.text}")
        raise RuntimeError("API call to /relaties failed")

    return response.json()
