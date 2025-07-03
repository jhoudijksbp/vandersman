resource "aws_s3_bucket" "frontend_bucket" {
  bucket = replace("${var.project_name}-frontend-bucket", "_", "-")
}

resource "aws_s3_bucket_website_configuration" "frontend_website_config" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_pacb" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls   = false
  block_public_policy = false
}

resource "aws_s3_bucket_policy" "website_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket" "rompslomp_data" {
  bucket = replace("${var.project_name}-rompslomp-data", "_", "-")

  tags = {
    Name        = "rompslomp-data-storage"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rompslomp_data" {
  bucket = aws_s3_bucket.rompslomp_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "rompslomp_data" {
  bucket = aws_s3_bucket.rompslomp_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "rompslomp_data" {
  bucket = aws_s3_bucket.rompslomp_data.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = [
      "http://localhost:3000",
      "http://${aws_s3_bucket_website_configuration.frontend_website_config.website_endpoint}",
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
