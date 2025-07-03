import pytest
import os
from lambda_code.functions.cognito_users.utils import fetch_cognito_users, upload_to_s3


@pytest.fixture
def mock_cognito_client(mocker):
    mock_client = mocker.Mock()
    mock_client.list_users.side_effect = [
        {
            "Users": [
                {
                    "Attributes": [
                        {"Name": "given_name", "Value": "Jeffrey"},
                        {"Name": "family_name", "Value": "Houdijk"},
                    ]
                },
                {
                    "Attributes": [
                        {"Name": "given_name", "Value": "Jip"},
                        {"Name": "family_name", "Value": "Amiabel"},
                    ]
                },
            ],
            "PaginationToken": None
        }
    ]
    mocker.patch("lambda_code.functions.cognito_users.utils.cognito", mock_client)
    return mock_client

@pytest.fixture
def mock_s3_client(mocker):
    mock_client = mocker.Mock()
    mocker.patch("lambda_code.functions.cognito_users.utils.s3", mock_client)
    return mock_client

def test_fetch_cognito_users(mock_cognito_client):
    users = fetch_cognito_users("mock-pool-id")
    assert users == [
        {"medewerker": "Jeffrey Houdijk"},
        {"medewerker": "Jip Amiabel"},
    ]
    mock_cognito_client.list_users.assert_called_once()

def test_upload_to_s3(mock_s3_client):
    data = [{"medewerker": "Jordy van der Sman"}]
    upload_to_s3(data, "mock-bucket", "mock-key.json")
    mock_s3_client.put_object.assert_called_once()
    args, kwargs = mock_s3_client.put_object.call_args
    assert kwargs["Bucket"] == "mock-bucket"
    assert kwargs["Key"] == "mock-key.json"
    assert "Jordy van der Sman" in kwargs["Body"]
