resource "aws_cognito_user_pool" "main" {
  name = "jvds-user-pool"

  username_attributes       = ["email"]
  auto_verified_attributes  = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  admin_create_user_config {
    allow_admin_create_user_only = true

    invite_message_template {
      email_subject = "Welkom bij de Jordy van der Sman Hoveniers Werkbon APP"
      email_message = "Hallo {username},\n\nJe account is aangemaakt. Gebruik deze code om je wachtwoord te configureren: {####}"
      sms_message   = "Hallo {username}, je verificatiecode is: {####}"
    }
  }

  mfa_configuration = "OFF"

  schema {
    attribute_data_type = "String"
    name                = "given_name"
    required            = false
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "family_name"
    required            = false
    mutable             = true
  }
}

resource "aws_cognito_user_pool_client" "react_app" {
  name         = "react-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  callback_urls = [
    "https://${aws_s3_bucket.frontend_bucket.bucket_regional_domain_name}",
    "http://localhost:3000/"
  ]

  logout_urls = [
    "https://${aws_s3_bucket.frontend_bucket.bucket_regional_domain_name}",
    "http://localhost:3000/"
  ]

  allowed_oauth_flows                    = ["code"]
  allowed_oauth_flows_user_pool_client  = true
  allowed_oauth_scopes                  = ["email", "openid", "profile"]
  supported_identity_providers          = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "default" {
  domain       = "jvds-werkbon-app"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "random_string" "suffix" {
  length  = 5
  special = false
}
