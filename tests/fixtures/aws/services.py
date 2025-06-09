import os
from unittest.mock import patch, MagicMock

import boto3
import pytest
from moto import (
    mock_dynamodb,
)

# #############################################################################
# AWS Services (moto)
# #############################################################################


@pytest.fixture(autouse=True, scope="session")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"


@pytest.fixture
def aws_dynamodb(aws_credentials):
    with mock_dynamodb():
        ddb = boto3.client("dynamodb")
        yield ddb

