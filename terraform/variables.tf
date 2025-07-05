variable "region" {
    default = "eu-west-1"
  
}
variable "key_pair_name" {
    description = "SSH key pair name"
    type = string
    sensitive = true
}

variable "ssh_cidr" {
    description = "CIDR blocks"
}