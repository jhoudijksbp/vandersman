import pytest

from krsv.functions.veo_download_clips.handler import (
    lambda_handler,
)


class TestStatus:
    @pytest.mark.parametrize(
        "request_details",
        [
            {
                "expected_output": "OK",
            }
        ],
    )
    @pytest.mark.usefixtures(
        "aws_lambda_context",
    )
    def test_lambda_handler(self, request_details, aws_lambda_context):
        event = {"CLIENT_ID": "P5hoMsrF64uugBIruXV21"}
        response = lambda_handler(event, aws_lambda_context)
        assert response["body"]["status"] == request_details["expected_output"]
