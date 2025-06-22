resource "aws_appsync_graphql_api" "example" {
  name                = "example-api"
  authentication_type = "API_KEY"

  log_config {
    field_log_level           = "ALL"
    cloudwatch_logs_role_arn = aws_iam_role.appsync_logs_role.arn
    exclude_verbose_content   = false
  }

  schema = file("${path.module}/schema.graphql")
}

resource "aws_appsync_api_key" "example" {
  api_id      = aws_appsync_graphql_api.example.id
  expires     = timeadd(timestamp(), "31536000s")
}



resource "aws_appsync_datasource" "dynamodb" {
  api_id           = aws_appsync_graphql_api.example.id
  name             = "ItemsTable"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_role.arn

  dynamodb_config {
    table_name =  var.werkbon_dynamodb_table.name
  }
}

resource "aws_appsync_resolver" "get_item" {
  api_id          = aws_appsync_graphql_api.example.id
  type            = "Query"
  field           = "getItem"
  data_source     = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "GetItem",
  "key": {
    "id": {
      "S": "$ctx.args.id"
    }
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}

resource "aws_appsync_resolver" "add_item" {
  api_id      = aws_appsync_graphql_api.example.id
  type        = "Mutation"
  field       = "addItem"
  data_source = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version" : "2018-05-29",
  "operation" : "PutItem",
  "key" : {
    "id" : $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
  },
  "attributeValues" : {
    "klant": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant),
    "medewerker": $util.dynamodb.toDynamoDBJson($ctx.args.input.medewerker),
    "products": $util.dynamodb.toDynamoDBJson($ctx.args.input.products),
    "services": $util.dynamodb.toDynamoDBJson($ctx.args.input.services),
    "datum": $util.dynamodb.toDynamoDBJson($ctx.args.input.datum)
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.args.input)
EOF

  depends_on = [
    aws_appsync_graphql_api.example
  ]
}

resource "aws_appsync_resolver" "list_items" {
  api_id          = aws_appsync_graphql_api.example.id
  type            = "Query"
  field           = "listItems"
  data_source     = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Scan"
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result.items)
EOF
}

resource "aws_appsync_resolver" "update_item" {
  api_id      = aws_appsync_graphql_api.example.id
  type        = "Mutation"
  field       = "updateItem"
  data_source = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version" : "2018-05-29",
  "operation" : "PutItem",
  "key" : {
    "id" : $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
  },
  "attributeValues" : {
    "klant": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant),
    "medewerker": $util.dynamodb.toDynamoDBJson($ctx.args.input.medewerker),
    "products": $util.dynamodb.toDynamoDBJson($ctx.args.input.products),
    "services": $util.dynamodb.toDynamoDBJson($ctx.args.input.services),
    "datum": $util.dynamodb.toDynamoDBJson($ctx.args.input.datum)
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.args.input)
EOF

  depends_on = [
    aws_appsync_graphql_api.example
  ]
}
