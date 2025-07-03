# ✅ Lambda Function: Sample (
resource "aws_lambda_function" "rompslomp_integrator_lambda" {
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

resource "aws_lambda_function" "get_cognito_users_lambda" {
  function_name     = "${var.project_name}GetCognitoUsers"
  role              = aws_iam_role.lambda_role.arn
  handler           = "lambda_code.functions.cognito_users.handler.lambda_handler"
  runtime           = var.python_version
  s3_bucket         = var.lambda_package_bucket
  s3_key            = var.lambda_package_key
  s3_object_version = var.lambda_package_version_id
  timeout           = 30
  memory_size       = 256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
      S3_BUCKET_NAME       = aws_s3_bucket.rompslomp_data.bucket
      S3_KEY               = "cognito_medewerkers.json"
    }
  }

  layers = [var.lambda_layer_arn]
}
