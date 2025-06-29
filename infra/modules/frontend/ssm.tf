resource "aws_ssm_parameter" "rompslomp_token" {
  name  = "/rompslomp/api_token"
  type  = "SecureString"
  value = "|REDACTED|"

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}
