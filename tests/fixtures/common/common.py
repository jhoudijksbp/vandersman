from unittest.mock import MagicMock


import pytest


@pytest.fixture()
def aws_lambda_context():
    lambda_context = MagicMock()
    lambda_context.invoked_function_arn = (
        "arn:aws:lambda:eu-west-1:0000000000:function:veo-download-clips"
    )
    return lambda_context
