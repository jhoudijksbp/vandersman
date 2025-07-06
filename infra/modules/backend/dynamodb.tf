resource "aws_dynamodb_table" "werkbon" {
  name         = "${var.project_name}-werkbon"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "datum"  # 👈 Sort key toevoegen

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "dummy"
    type = "S"
  }

  attribute {
    name = "klant_id"
    type = "S"
  }

  attribute {
    name = "datum"
    type = "S"
  }

  global_secondary_index {
    name            = "datum-index"
    hash_key        = "dummy"
    range_key       = "datum"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "klant-index"
    hash_key        = "klant_id"
    range_key       = "datum" 
    projection_type = "ALL"
  }
}
