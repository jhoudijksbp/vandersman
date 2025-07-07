from unittest.mock import MagicMock
from lambda_code.functions.rompslomp_integrator.handler_invoice import lambda_handler


def test_lambda_handler_returns_werkbonnen(populate_werkbon_data, werkbon_records):
    event = {
        "ids": [(record["id"], record["datum"]) for record in werkbon_records]
    }

    # ✅ Mock een context zoals AWS dat doet
    mock_context = MagicMock()
    mock_context.function_name = "test-func"
    mock_context.memory_limit_in_mb = "128"
    mock_context.invoked_function_arn = "arn:aws:lambda:eu-west-1:123456789012:function:test"
    mock_context.aws_request_id = "test-request-id"

    response = lambda_handler(event, context=mock_context)

    assert response["statusCode"] == 200
