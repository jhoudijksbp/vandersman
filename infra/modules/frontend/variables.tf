variable "shared_kms_key_arn" {
  type        = string
  default     = null
  description = "The ARN of the baseline provided KMS key"
}

variable "lambda_layer_arn" {
  type        = string
  default     = null
  description = "The ARN of the lambda layer"
}

variable "lambda_package_bucket" {
  type        = string
  description = "AWS S3 bucket for Lambda package"
}

variable "lambda_package_key" {
  type        = string
  description = "AWS S3 key for Lambda package"
}

variable "lambda_package_version_id" {
  type        = string
  description = "AWS S3 version ID for Lambda package"
}

variable "project_name" {
  type        = string
  description = "The name of the project"
}

variable "python_version" {
  type        = string
  default     = "3.11"
  description = "The Python version to use for the Lambda function"
}

variable "region" {
  type        = string
  default     = "us-west-1"
  description = "The AWS region to deploy the resources in"
}

variable "werkbon_dynamodb_table" {
  description = "Full DynamoDB table configuration object"
  type = any
}
