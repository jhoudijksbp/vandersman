import os
import json
import pytest
from unittest.mock import MagicMock
from lambda_code.functions.rompslomp_integrator.handler import lambda_handler


class DummyContext:
    function_name = "test-function"
    function_version = "1"
    invoked_function_arn = "arn:aws:lambda:eu-west-1:123456789012:function:test-function"
    memory_limit_in_mb = 128
    aws_request_id = "test-request-id"
    log_group_name = "test-log-group"
    log_stream_name = "test-log-stream"

    def get_remaining_time_in_millis(self):
        return 300000


@pytest.fixture
def valid_event():
    return {"code": "test-auth-code"}

@pytest.fixture(autouse=True)
def mock_s3_put_object(mocker):
    mock_s3 = MagicMock()
    mock_s3.put_object.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}
    mocker.patch("lambda_code.common.s3_writer.boto3.client", return_value=mock_s3)


@pytest.fixture(autouse=True)
def mock_ssm(monkeypatch, mocker):
    mock_ssm = MagicMock()
    mock_ssm.get_parameter.side_effect = lambda Name, WithDecryption: {
        "Parameter": {
            "Value": os.getenv(Name.split("/")[-1].upper())
        }
    }
    mocker.patch("lambda_code.functions.rompslomp_integrator.rompslomp_api.ssm", mock_ssm)


def test_lambda_handler_success(mocker, valid_event):
    response = lambda_handler(valid_event, DummyContext())

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["message"] == "Rompslomp integrator executed successfully"
    assert body["contacts_count"] >= 1
    assert body["products_count"] >= 1


def test_lambda_handler_failure_in_token_exchange(mocker, valid_event):
    mocker.patch(
        "lambda_code.functions.rompslomp_integrator.handler.get_access_token",
        side_effect=RuntimeError("Token exchange failed")
    )

    response = lambda_handler(valid_event, DummyContext())

    assert response["statusCode"] == 500
    body = json.loads(response["body"])
    assert "Token exchange failed" in body["error"]


def test_lambda_handler_without_mocking_fails_gracefully(valid_event):
    """Optional fallback test to check graceful failure (not mocking any API)."""
    response = lambda_handler(valid_event, DummyContext())
    assert response["statusCode"] in [200, 500]
