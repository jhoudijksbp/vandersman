output "werkbon_dynamodb_table" {
  value = aws_dynamodb_table.werkbon
  description = "Full DynamoDB table resource object for Werkbon"
}
