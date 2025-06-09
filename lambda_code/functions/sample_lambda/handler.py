import json
from aws_lambda_powertools import Logger

# Set up structured logging using AWS Lambda Powertools
logger = Logger()

def lambda_handler(event, context):
    logger.info("vanderSman Lambda function has been invoked.")
    logger.info({"event": event})

    # Example processing
    response = {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Function executed successfully.",
            "input": event
        })
    }

    logger.info("Returning response.")
    return response
