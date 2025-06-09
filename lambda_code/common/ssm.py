import boto3


def update_ssm_parameter(parameter_name, type, value):
    ssm_client = boto3.client("ssm", region_name="us-west-1")
    ssm_client.put_parameter(
        Name=parameter_name,
        Value=value,
        Type=type,
        Overwrite=True
    )


def get_ssm_parameter(parameter_name, Decryption=True):
    # Create a session using Boto3
    ssm_client = boto3.client("ssm", region_name="us-west-1")

    try:
        # Get the parameter value
        response = ssm_client.get_parameter(Name=parameter_name, WithDecryption=True)

        # Extract the value
        parameter_value = response["Parameter"]["Value"]
        return parameter_value

    except Exception as e:
        print(f"Error fetching SSM parameter: {e}")
        return None

