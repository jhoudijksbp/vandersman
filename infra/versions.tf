terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.64.0"
    }
  }

}

provider "aws" {
  region  = local.region
}