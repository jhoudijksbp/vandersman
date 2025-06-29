# ✅ Lambda Function: Sample (
resource "aws_lambda_function" "sample_lambda" {
  function_name     = "${var.project_name}RomsplompIntegrator"
  role              = aws_iam_role.lambda_role.arn
  handler           = "lambda_code.functions.rompslomp_integrator.handler.lambda_handler"
  runtime           = var.python_version
  s3_bucket         = var.lambda_package_bucket
  s3_key            = var.lambda_package_key
  s3_object_version = var.lambda_package_version_id
  timeout           = 30
  memory_size       = 256

  environment {
    variables = {
      ROMPSLOMP_S3_BUCKET = aws_s3_bucket.rompslomp_data.bucket
    }
  }

  layers = [var.lambda_layer_arn]
}
