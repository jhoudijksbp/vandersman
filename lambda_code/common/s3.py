import boto3
import json

def list_s3_files(bucket_name, folder_prefix):
    # Initialize S3 client
    s3_client = boto3.client("s3")

    try:
        # List objects in the specified folder
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=folder_prefix)
        
        # Check if folder contains files
        if "Contents" in response:
            return [item["Key"] for item in response["Contents"]]
        else:
            return []
    except Exception as e:
        raise RuntimeError(f"Error listing files: {str(e)}")

def copy_missing_files_to_bucket(filenames, existing_files, destination_bucket, target_prefix=""):
    s3_client = boto3.client("s3")

    try:
        for url in filenames:
            filename = url.split("/")[-1]
            if filename not in existing_files:
                source_bucket = url.split("/")[2]
                source_key = "/".join(url.split("/")[3:])
                
                # Copy the file
                copy_source = {"Bucket": source_bucket, "Key": source_key}
                destination_key = f"{target_prefix}{filename}" if target_prefix else filename
                s3_client.copy_object(CopySource=copy_source, Bucket=destination_bucket, Key=destination_key)
                print(f"Copied {filename} to {destination_bucket}/{destination_key}")
    except Exception as e:
        raise RuntimeError(f"Error copying files: {str(e)}")

def delete_extra_files_from_bucket(extra_files, bucket_name, folder_prefix=""):
    s3_client = boto3.client("s3")

    try:
        for file_key in extra_files:
            full_key = f"{folder_prefix}{file_key}" if folder_prefix else file_key
            s3_client.delete_object(Bucket=bucket_name, Key=full_key)
            print(f"Deleted {full_key} from {bucket_name}")
    except Exception as e:
        raise RuntimeError(f"Error deleting files: {str(e)}")


def write_file_to_s3(data, bucket_name, prefix_folder):
    s3_client = boto3.client("s3")
    key = f"{prefix_folder.rstrip('/')}/matches.json"

    try:
        data_json = json.dumps(data, indent=4)
        s3_client.put_object(Bucket=bucket_name, Key=key, Body=data_json, ContentType="application/json")
        print(f"Metadata written to {key} in bucket {bucket_name}")
    except Exception as e:
        raise RuntimeError(f"Error writing metadata to S3: {str(e)}")
