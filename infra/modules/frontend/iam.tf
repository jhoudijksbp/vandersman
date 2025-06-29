resource "aws_iam_role" "appsync_logs_role" {
  name = "AppSyncCloudWatchLogsRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}


resource "aws_iam_role_policy" "appsync_logs_policy" {
  name = "AppSyncLoggingPolicy"
  role = aws_iam_role.appsync_logs_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "appsync_role" {
  name = "appsync-dynamo-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "appsync.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "appsync_policy" {
  name = "appsync-dynamo-access"
  role = aws_iam_role.appsync_role.id

    policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
        {
        Action = [
            "dynamodb:GetItem",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:PutItem"
        ],
        Effect   = "Allow",
        Resource = var.werkbon_dynamodb_table.arn
        }
    ]
    })
}

resource "aws_iam_policy" "rompslomp_s3_readonly" {
  name        = "RompslompS3ReadOnlyPolicy"
  description = "Allow read-only access to Rompslomp S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "AllowReadRompslompData"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.rompslomp_data.arn,
          "${aws_s3_bucket.rompslomp_data.arn}/*"
        ]
      }
    ]
  })
}


resource "aws_iam_role" "cognito_authenticated_role" {
  name = "CognitoRompslompReadOnlyRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = "<your-identity-pool-id>"
          },
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_readonly_policy" {
  role       = aws_iam_role.cognito_authenticated_role.name
  policy_arn = aws_iam_policy.rompslomp_s3_readonly.arn
}
