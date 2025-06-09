# Define local variable with multiple users
locals {
  users = {}
}

# Step 1: Create IAM Users
resource "aws_iam_user" "admin_users" {
  for_each = local.users

  name = each.key
  tags = {
    Email = each.value
  }
}

# Step 2: Attach Admin Policy (AFTER MFA is enabled)
resource "aws_iam_user_policy_attachment" "admin_policy" {
  for_each = local.users

  user       = aws_iam_user.admin_users[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
