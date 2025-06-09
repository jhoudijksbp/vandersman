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
