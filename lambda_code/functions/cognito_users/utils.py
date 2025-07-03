import boto3
import json
from aws_lambda_powertools import Logger

logger = Logger()
cognito = boto3.client("cognito-idp")
s3 = boto3.client("s3")

def fetch_cognito_users(user_pool_id):
    users = []
    pagination_token = None

    while True:
        params = {
            "UserPoolId": user_pool_id,
            "Limit": 60,
        }
        if pagination_token:
            params["PaginationToken"] = pagination_token

        response = cognito.list_users(**params)

        for user in response["Users"]:
            given_name = ""
            family_name = ""
            for attr in user["Attributes"]:
                if attr["Name"] == "given_name":
                    given_name = attr["Value"]
                elif attr["Name"] == "family_name":
                    family_name = attr["Value"]

            full_name = f"{given_name} {family_name}".strip()
            if full_name:
                users.append({"medewerker": full_name})

        pagination_token = response.get("PaginationToken")
        if not pagination_token:
            break

    return users

def upload_to_s3(data, bucket_name, key):
    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=json.dumps(data),
            ContentType="application/json"
        )
    except Exception as e:
        logger.exception("Fout bij upload naar S3")
        raise e
