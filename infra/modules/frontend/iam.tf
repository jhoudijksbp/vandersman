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
  name = "appsync-dynamo-lambda-access"
  role = aws_iam_role.appsync_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "DynamoDBAccess",
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        Resource = [
          var.werkbon_dynamodb_table.arn,
          "${var.werkbon_dynamodb_table.arn}/index/datum-index",
          "${var.werkbon_dynamodb_table.arn}/index/klant-index"
        ]
      },
      {
        Sid    = "LambdaInvokeAccess",
        Effect = "Allow",
        Action = [
          "lambda:InvokeFunction"
        ],
        Resource = [
          aws_lambda_function.rompslomp_integrator_lambda.arn,
          aws_lambda_function.get_cognito_users_lambda.arn,
          aws_lambda_function.rompslomp_facturatie_lambda.arn
        ]
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
  name = "${var.project_name}-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Federated = "cognito-identity.amazonaws.com"
      },
      Action = "sts:AssumeRoleWithWebIdentity",
      Condition = {
        StringEquals = {
          "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
        },
        "ForAnyValue:StringLike" = {
          "cognito-identity.amazonaws.com:amr" = "authenticated"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "attach_readonly_policy" {
  role       = aws_iam_role.cognito_authenticated_role.name
  policy_arn = aws_iam_policy.rompslomp_s3_readonly.arn
}

# ✅ IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_role" {
  name = "lambda_frontend_ssm_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}



# ✅ IAM Policy for SSM Parameter Store Access
resource "aws_iam_policy" "ssm_policy" {
  name        = "${var.project_name}LambdaFrontendSSMParameterPolicy"
  description = "Allows Lambda to read and write SSM parameters"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
        ]
        Effect   = "Allow"
        Resource = aws_ssm_parameter.rompslomp_token.arn
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.project_name}-FrontendLambdaPolicy"
  description = "Allows Lambda to access S3, CloudWatch Logs, DynamoDB, and SSM"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:*",
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.rompslomp_data.arn,
          "${aws_s3_bucket.rompslomp_data.arn}/*"
        ]
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action = [
          "cognito-idp:ListUsers"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
        ]
        Effect = "Allow"
        Resource = [
          var.werkbon_dynamodb_table.arn,
        ]
      },
      {
        Action = [
          "ssm:GetParameter"
        ]
        Effect = "Allow"
        Resource = aws_ssm_parameter.rompslomp_token.arn
      }
    ]
  })
}

# ✅ Attach DynamoDB & SSM Policies to Lambda Role
resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_ssm_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.ssm_policy.arn
}
