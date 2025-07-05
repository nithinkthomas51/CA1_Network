output "ec2_public_ip" {
    description = "The public IP of the EC2 instance"
    value = aws_instance.app_instance.public_ip
}