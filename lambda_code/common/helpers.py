def create_lambda_response(message="OK", status_code=200):
    response = {"body": {"message": message, "status": "OK"}, "statusCode": status_code}

    return response
