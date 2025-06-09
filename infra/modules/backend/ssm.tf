resource "aws_ssm_parameter" "sample" {
  name  = "/sample/sample"
  type  = "String"
  value = "0"

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}
