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
