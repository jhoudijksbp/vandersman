# ✅ IAM Role for Lambda Functions
resource "aws_iam_role" "lambda_role" {
  name = "lambda_dynamodb_ssm_role"

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

# ✅ IAM Policy for DynamoDB Access
resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.project_name}-DynamoDBPolicy"
  description = "Allows Lambda to access DynamoDB tables"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.werkbon.arn,
          "${aws_dynamodb_table.werkbon.arn}/*",
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
      }
    ]
  })
}

# ✅ IAM Policy for SSM Parameter Store Access
resource "aws_iam_policy" "ssm_policy" {
  name        = "${var.project_name}LambdaSSMParameterPolicy"
  description = "Allows Lambda to read and write SSM parameters"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:PutParameter"
        ]
        Effect   = "Allow"
        Resource = aws_ssm_parameter.sample.arn
      }
    ]
  })
}

# ✅ Attach DynamoDB & SSM Policies to Lambda Role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_ssm_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.ssm_policy.arn
}
