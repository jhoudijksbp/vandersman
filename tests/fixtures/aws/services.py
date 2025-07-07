import os
import boto3
import pytest
from moto import mock_dynamodb


@pytest.fixture(autouse=True, scope="session")
def aws_credentials():
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-west-1"


@pytest.fixture
def aws_dynamodb(aws_credentials):
    with mock_dynamodb():
        dynamodb = boto3.resource("dynamodb", region_name="us-west-1")
        yield dynamodb
