data "aws_iam_policy_document" "policy_oidc" {
  statement {
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = [aws_kms_key.objects.arn]
  }

  statement {
    actions = [
      "s3:*"
    ]
    resources = [   
      module.s3_bucket_artifacts.arn,
      module.frontend.frontend_bucket_arn,
      "${module.s3_bucket_artifacts.arn}/*",
      "${module.frontend.frontend_bucket_arn}/*",
    ]
  }
}

resource "aws_iam_policy" "oidc_policy" {
  name        = "${local.project_name}ProjectOidcRole"
  path        = "/"
  description = "Policy for Github actions to deploy python Lambvda"
  policy      = data.aws_iam_policy_document.policy_oidc.json
}

module "github-oidc" {
  source  = "terraform-module/github-oidc-provider/aws"
  version = "~> 1"

  create_oidc_provider = true
  create_oidc_role     = true

  repositories              = local.project_repositories
  role_name                 = "${local.project_name}ProjectOidcRole"
  role_description          = "Role for Github actions"
  oidc_role_attach_policies = [aws_iam_policy.oidc_policy.arn]
}
