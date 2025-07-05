provider "aws" {
  region = var.region
}

resource "aws_security_group" "app_sg" {
  name        = "app_security_group"
  description = "Allow SSH and app port 3000"

  ingress {
    description      = "SSH"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = [var.ssh_cidr]
  }

  ingress {
    description      = "App Port 3000"
    from_port        = 3000
    to_port          = 3000
    protocol         = "tcp"
    cidr_blocks      = [var.ssh_cidr]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"   # means all protocols
    cidr_blocks = [var.ssh_cidr]
  }
}

resource "aws_instance" "app_instance" {
  ami           = "ami-01f23391a59163da9"
  instance_type = "t2.micro"
  key_name      = var.key_pair_name
  security_groups = [aws_security_group.app_sg.name]

  tags = {
    Name = "node_app_server"
  }
}
