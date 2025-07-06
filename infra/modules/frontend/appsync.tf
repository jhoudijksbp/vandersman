resource "aws_appsync_graphql_api" "appsync_api" {
  name                = "${var.project_name}-api"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"

  user_pool_config {
    user_pool_id     = aws_cognito_user_pool.main.id
    aws_region       = "us-west-1"
    default_action   = "ALLOW"
  }

  log_config {
    field_log_level           = "ALL"
    cloudwatch_logs_role_arn = aws_iam_role.appsync_logs_role.arn
    exclude_verbose_content   = false
  }

  schema = file("${path.module}/schema.graphql")
}

resource "aws_appsync_datasource" "dynamodb" {
  api_id           = aws_appsync_graphql_api.appsync_api.id
  name             = "ItemsTable"
  type             = "AMAZON_DYNAMODB"
  service_role_arn = aws_iam_role.appsync_role.arn

  dynamodb_config {
    table_name =  var.werkbon_dynamodb_table.name
  }
}

resource "aws_appsync_resolver" "get_item" {
  api_id          = aws_appsync_graphql_api.appsync_api.id
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
  api_id      = aws_appsync_graphql_api.appsync_api.id
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
    "klant_id": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant_id),
    "klant_naam": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant_naam),
    "medewerker": $util.dynamodb.toDynamoDBJson($ctx.args.input.medewerker),
    "products": $util.dynamodb.toDynamoDBJson($ctx.args.input.products),
    "services": $util.dynamodb.toDynamoDBJson($ctx.args.input.services),
    "datum": $util.dynamodb.toDynamoDBJson($ctx.args.input.datum),
    "datumOpdracht": $util.dynamodb.toDynamoDBJson($ctx.args.input.datumOpdracht),
    "dummy": $util.dynamodb.toDynamoDBJson($ctx.args.input.dummy)
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.args.input)
EOF

  depends_on = [
    aws_appsync_graphql_api.appsync_api
  ]
}

resource "aws_appsync_resolver" "update_item" {
  api_id      = aws_appsync_graphql_api.appsync_api.id
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
    "klant_id": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant_id),
    "klant_naam": $util.dynamodb.toDynamoDBJson($ctx.args.input.klant_naam),
    "medewerker": $util.dynamodb.toDynamoDBJson($ctx.args.input.medewerker),
    "products": $util.dynamodb.toDynamoDBJson($ctx.args.input.products),
    "services": $util.dynamodb.toDynamoDBJson($ctx.args.input.services),
    "datum": $util.dynamodb.toDynamoDBJson($ctx.args.input.datum),
    "datumOpdracht": $util.dynamodb.toDynamoDBJson($ctx.args.input.datumOpdracht),
    "dummy": $util.dynamodb.toDynamoDBJson($ctx.args.input.dummy)
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.args.input)
EOF

  depends_on = [
    aws_appsync_graphql_api.appsync_api
  ]
}

resource "aws_appsync_resolver" "list_items" {
  api_id      = aws_appsync_graphql_api.appsync_api.id
  type        = "Query"
  field       = "listItems"
  data_source = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Query",
  "index": "datum-index",
  "query": {
    "expression": "#dummy = :dummy AND #datum BETWEEN :from AND :to",
    "expressionNames": {
      "#dummy": "dummy",
      "#datum": "datum"
    },
    "expressionValues": {
      ":dummy": { "S": "werkbon" },
      ":from": { "S": "$ctx.args.from" },
      ":to": { "S": "$ctx.args.to" }
    }
  }
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result.items)
EOF
}

resource "aws_appsync_resolver" "list_items_by_klant" {
  api_id      = aws_appsync_graphql_api.appsync_api.id
  type        = "Query"
  field       = "listItemsByKlant"
  data_source = aws_appsync_datasource.dynamodb.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Query",
  "index": "klant-index",
  "query": {
    "expression": "#klant_id = :klant_id",
    "expressionNames": {
      "#klant_id": "klant_id"
    },
    "expressionValues": {
      ":klant_id": { "S": "$ctx.args.klant_id" }
    }
  },
  "scanIndexForward": false
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result.items)
EOF
}

resource "aws_appsync_datasource" "lambda_trigger_rompslomp_job" {
  api_id           = aws_appsync_graphql_api.appsync_api.id
  name             = "RompslompDataDatasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_role.arn

  lambda_config {
    function_arn = aws_lambda_function.rompslomp_integrator_lambda.arn
  }
}

resource "aws_appsync_datasource" "lambda_trigger_cognito_job" {
  api_id           = aws_appsync_graphql_api.appsync_api.id
  name             = "CognitoUsersDatasource"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_role.arn

  lambda_config {
    function_arn = aws_lambda_function.get_cognito_users_lambda.arn
  }
}

resource "aws_appsync_resolver" "trigger_job_rompslomp_data" {
  api_id      = aws_appsync_graphql_api.appsync_api.id
  type        = "Mutation"
  field       = "triggerRomsplompDataJob"
  data_source = aws_appsync_datasource.lambda_trigger_rompslomp_job.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {}
}
EOF
 
  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}

resource "aws_appsync_resolver" "trigger_job_cognito_users" {
  api_id      = aws_appsync_graphql_api.appsync_api.id
  type        = "Mutation"
  field       = "triggerGetCognitoJob"
  data_source = aws_appsync_datasource.lambda_trigger_cognito_job.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {}
}
EOF

  response_template = <<EOF
$util.toJson($ctx.result)
EOF
}
