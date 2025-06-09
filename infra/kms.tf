resource "aws_kms_key" "objects" {
  description             = "KMS key is used to encrypt bucket objects and more"
  deletion_window_in_days = 7

  policy = jsonencode({
    "Version": "2012-10-17",
    "Id": "default",
    "Statement": [
      {
        "Sid": "DefaultAllow",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        "Action": "kms:*",
        "Resource": "*"
        
      },
      {
        Effect    = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.name}.amazonaws.com"
        }
        Action    = [
          "kms:*"
        ]
        Resource  = "*"
      }
    ]
  })
}
