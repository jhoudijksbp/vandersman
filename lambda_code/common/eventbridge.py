import json
import boto3


from aws_lambda_powertools import Logger
from datetime import datetime
from botocore.exceptions import ClientError
from aws_lambda_powertools import Logger


# Initialize the EventBridge client
eventbridge_client = boto3.client("events")

logger = Logger()

def push_event_to_eventbridge(source: str, detail_type: str, detail: dict) -> bool:
    """
    Pushes an event to Amazon EventBridge.

    Args:
        source (str): The source of the event (e.g., "krsv.veo").
        detail_type (str): A description of the event type (e.g., "VeoClipProcessed").
        detail (dict): The event payload, which will be converted to a JSON string.

    Returns:
        bool: True if the event was successfully sent, False otherwise.
    """
    try:
        # Ensure the detail is properly JSON encoded
        response = eventbridge_client.put_events(
            Entries=[
                {
                    "Source": source,
                    "DetailType": detail_type,
                    "Detail": json.dumps(detail),  # Ensure this is JSON-encoded
                    "EventBusName": "default",  # Change if using a custom event bus
                    "Time": datetime.utcnow(),  # Event timestamp
                }
            ]
        )

        # Check for failed entries
        if response['FailedEntryCount'] > 0:
            for entry in response['Entries']:
                if 'ErrorCode' in entry:
                    logger.info(f"Failed to push event: {entry['ErrorCode']} - {entry['ErrorMessage']}")
                    raise
            return False
        return True
    except ClientError as e:
        print(f"Failed to send event to EventBridge: {e}")
        return False
