module "s3_bucket_artifacts" {
  source                = "github.com/schubergphilis/terraform-aws-mcaf-s3?ref=v0.14.1"
  name                  = replace("${local.project_name}-artifacts", "_", "-")
  kms_key_arn           = aws_kms_key.objects.arn
  object_ownership_type = "BucketOwnerEnforced"
  versioning            = true

  lifecycle_rule = [
    {
      id                                     = "default"
      enabled                                = true
      abort_incomplete_multipart_upload_days = 14

      noncurrent_version_expiration = {
        noncurrent_days = 30
      }
    }
  ]
}

data "aws_s3_object" "lambda_package" {
  bucket = module.s3_bucket_artifacts.name
  key    = "lambda_code.zip"
}

data "aws_s3_object" "lambda_package_lib" {
  bucket = module.s3_bucket_artifacts.name
  key    = "lambda_code-libs.zip"
}

resource "aws_lambda_layer_version" "python_libs" {
  layer_name          = "python-libs"
  s3_bucket           = data.aws_s3_object.lambda_package_lib.bucket
  s3_key              = data.aws_s3_object.lambda_package_lib.key
  s3_object_version   = data.aws_s3_object.lambda_package_lib.version_id
  compatible_runtimes = ["${local.python_version}"]
}
