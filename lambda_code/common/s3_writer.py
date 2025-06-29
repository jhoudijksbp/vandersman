# lambda_code/common/s3_writer.py
import boto3
import json
from aws_lambda_powertools import Logger
from datetime import datetime


logger = Logger(service="s3_writer")


def write_json_to_s3(data: list[dict], bucket: str, key_prefix: str):
    s3 = boto3.client("s3")
    key = f"{key_prefix}.json"
    logger.info(f"Writing data to S3 bucket {bucket} with key {key}")
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(data, indent=2),
        ContentType="application/json",
    )
    return key