locals {
  project_budget       = "20"
  project_email        = ["jeffreyhoudijk+vdsman@hotmail.com"]
  project_name         = "vandersman"
  project_repositories = ["jhoudijksbp/${local.project_name}"]
  python_version       = "python3.11"
  region               = "us-west-1"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

module "backend" {
  source                     = "./modules/backend"
  providers                  = { aws = aws }
  lambda_layer_arn           = aws_lambda_layer_version.python_libs.arn
  lambda_package_bucket      = data.aws_s3_object.lambda_package.bucket
  lambda_package_key         = data.aws_s3_object.lambda_package.key
  lambda_package_version_id  = data.aws_s3_object.lambda_package.version_id
  project_name               = local.project_name
  python_version             = local.python_version
  shared_kms_key_arn         = aws_kms_key.objects.arn
}

module "frontend" {
  source                        = "./modules/frontend"
  providers                     = { aws = aws }
  lambda_layer_arn              = aws_lambda_layer_version.python_libs.arn
  lambda_package_bucket         = data.aws_s3_object.lambda_package.bucket
  lambda_package_key            = data.aws_s3_object.lambda_package.key
  lambda_package_version_id     = data.aws_s3_object.lambda_package.version_id
  project_name                  = local.project_name
  shared_kms_key_arn            = aws_kms_key.objects.arn
  werkbon_dynamodb_table        = module.backend.werkbon_dynamodb_table

  depends_on = [
    module.backend,
    aws_lambda_layer_version.python_libs
  ]
}
