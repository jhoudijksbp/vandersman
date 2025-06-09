import pytest

from krsv.functions.veo_retrieve.handler import (
    lambda_handler,
)


class TestStatus:
    @pytest.mark.usefixtures(
        "lambda_context_veo_retrieve",
    )
    def test_can_handle_veo_retrieve(
        self,
        lambda_context_veo_retrieve,
    ):
        result = lambda_handler({}, lambda_context_veo_retrieve)
        assert result["statusCode"] == 200
