output "frontend_bucket_arn" {
  value       = aws_s3_bucket.frontend_bucket.arn
  description = "ARN of the frontend bucket"
}
