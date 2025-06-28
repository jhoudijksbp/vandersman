import sys
import json
import pytest

from lambda_code.functions.rompslomp_integrator.handler import (
    lambda_handler,
)

@pytest.fixture
def valid_event():
    return {
        "queryStringParameters": {
            "code": "test-auth-code"
        }
    }

def test_lambda_handler_success(mocker, valid_event):
    # Mock get_access_token and fetch_relaties
    mocker.patch("rompslomp_api.get_access_token", return_value="test-access-token")
    mocker.patch("rompslomp_api.fetch_relaties", return_value=[{"id": 1, "naam": "Test Relatie"}])

    response = lambda_handler(valid_event, None)
    body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert "relaties" in body
    assert body["relaties"][0]["naam"] == "Test Relatie"


def test_lambda_handler_missing_code():
    event = {"queryStringParameters": {}}
    response = lambda_handler(event, None)
    body = json.loads(response["body"])

    assert response["statusCode"] == 400
    assert body["error"] == "Missing authorization code"


def test_lambda_handler_failure_in_token_exchange(mocker, valid_event):
    mocker.patch("rompslomp_api.get_access_token", side_effect=RuntimeError("Token exchange failed"))
    
    response = lambda_handler(valid_event, None)
    body = json.loads(response["body"])

    assert response["statusCode"] == 500
    assert "Token exchange failed" in body["error"]
