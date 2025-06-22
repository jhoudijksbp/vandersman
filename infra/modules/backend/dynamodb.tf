# ✅ DynamoDB Table: cryptohoudini-fills (Stores individual trades)
resource "aws_dynamodb_table" "werkbon" {
  name         =  "${var.project_name}-werkbon"
  billing_mode = "PAY_PER_REQUEST" 
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}