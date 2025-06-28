from dataclasses import dataclass

import pytest


@pytest.fixture(scope="function")
def lambda_context_veo_retrieve():
    @dataclass
    class LambdaContext:
        function_name: str = ("KRSVVeoRetrieve",)
        aws_request_id: str = "88888888-4444-4444-4444-121212121212"
        invoked_function_arn: str = (
            "arn:aws:lambda:eu-west-1:123456789101:function:KRSVVeoRetrieve"
        )
        memory_limit_in_mb: int = 256

    return LambdaContext()


@pytest.fixture(scope="function")
def dynamodb_table_matches(aws_dynamodb):
    table_name = "cryptohoudini-fills"
    table_definition = {
        "TableName": table_name,
        "AttributeDefinitions": [
            {"AttributeName": "order_id", "AttributeType": "S"},
            {"AttributeName": "time", "AttributeType": "N"},
            {"AttributeName": "coin", "AttributeType": "S"},
            {"AttributeName": "order_type_position", "AttributeType": "S"},
            {"AttributeName": "aggregated", "AttributeType": "S"},
        ],
        "KeySchema": [
            {"AttributeName": "order_id", "KeyType": "HASH"},
            {"AttributeName": "time", "KeyType": "RANGE"},
        ],
        "BillingMode": "PAY_PER_REQUEST",
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "coin-order-type-index",
                "KeySchema": [
                    {
                        "AttributeName": "coin",
                        "KeyType": "HASH",
                    },
                    {
                        "AttributeName": "order_type_position",
                        "KeyType": "RANGE",
                    },
                ],
                "Projection": {"ProjectionType": "ALL"},
            },
            {
                "IndexName": "aggregated-type-index",
                "KeySchema": [
                    {
                        "AttributeName": "aggregated",
                        "KeyType": "HASH",
                    },  # ✅ GSI Partition Key
                    {"AttributeName": "time", "KeyType": "RANGE"},  # ✅ GSI Sort Key
                ],
                "Projection": {"ProjectionType": "ALL"},
            },
        ],
    }
    aws_dynamodb.create_table(**table_definition)
    yield aws_dynamodb
