resource "aws_budgets_budget" "monthly_budget" {
  name              = "Monthly-Budget"
  budget_type       = "COST"
  limit_amount      = local.project_budget
  limit_unit        = "USD"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = local.project_email
  }
}