# 🚀 Cloud Infrastructure Automation and CI/CD Pipeline

This project demonstrates end-to-end automation of cloud infrastructure provisioning, configuration management, application deployment using Docker, and CI/CD integration using Jenkins. It is designed to run on AWS EC2 and uses modern DevOps tools including **Terraform**, **Ansible**, **Docker**, and **Jenkins**.

---

## 📁 Project Structure

```
CA1_Network
├── Dockerfile
├── Jenkinsfile
├── ansible
│   ├── deploy_app.yml
│   └── hosts.ini
├── src
│   ├── client
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   └── server
│       ├── index.js
│       ├── package-lock.json
│       ├── package.json
│       └── userDB.db
└── terraform
    ├── main.tf
    ├── outputs.tf
    └── variables.tf
```

---

## 🛠️ Tools Used

- **Terraform**: Infrastructure provisioning (AWS EC2, security groups, networking)
- **Ansible**: Server configuration and Docker installation
- **Docker**: Application containerization
- **Jenkins**: CI/CD pipeline orchestration
- **GitHub**: Version control and repository hosting
- **AWS**: Cloud platform for hosting the infrastructure

---

## 📌 Prerequisites

- AWS CLI configured with IAM user credentials
- SSH Key pair for EC2 access
- Terraform installed
- Ansible installed
- Docker installed on local/WSL machine (for Jenkins setup)
- Jenkins installed and configured with required plugins

---

## 🌐 Step-by-Step Workflow

### 1️⃣ Infrastructure Provisioning with Terraform

Navigate to the `terraform/` directory and follow the steps below:

```bash
cd terraform/

# Initialize Terraform
terraform init

# (Optional) Preview infrastructure changes
terraform plan

# Apply infrastructure changes and provision EC2
terraform apply -var="key_pair_name=< your key name here>" -var="ssh_cidr=0.0.0.0/0"

```

📝 Note: After successful execution, Terraform will output the public IP of the EC2 instance.

### 2️⃣ Server Configuration using Ansible

Switch to the ansible/ directory and update the hosts.ini file with the public IP of the newly created EC2 instance.

```ini
[app]
<EC2 instance public IP> ansible_user=ubuntu
```

Then execute the Ansible playbook:

```bash
cd ../ansible/

# Run the playbook to install Docker and deploy the app
ansible-playbook -i ansible/hosts.ini ansible/deploy_app.yml --extra-vars "dockerhub_username=<your dockerhub username>" dockerhub_password=<your dockerhub password>" --private-key <path to the EC2 instance key pair>
```

🛠️ What this does:

Installs Docker and its dependencies

Enables Docker service on boot

Copies and builds the Docker image for the sample app

Runs the container on the EC2 instance

### 3️⃣ Application Deployment with Docker

Your Node.js app is containerized using the **Dockerfile** provided in the root directory.

```dockerfile
FROM node:18
WORKDIR /app
COPY src/server/package*.json ./src/server/
RUN cd src/server && npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server/index.js"]
```

The app listens on port 3000 and is exposed to the internet via EC2's public IP and security group rules.

### 4️⃣ Jenkins CI/CD Pipeline Integration

The Jenkins pipeline is defined in the **Jenkinsfile** and performs the following:

1. Pulls the latest code from GitHub
2. Build and pushes the docker image to Dockerhub repository
3. Initializes terraform
4. Conditionally creates EC2 instance (only if a new instance needs to be created, else jenkins skips this step)
5. Fetches the EC2 instance IP from the terraform output
6. Updates the Ansible inventory file with EC2 instance IP and username
7. 60-seconds wait for the newly created EC2 instance to be initialized (Executes only when a new EC2 instance is created)
8. Runs the Ansible playbook, which SSH into the instance, install all the dependencies, pull the image from dockerhub repository and starts the docker container.

✅ Poll SCM Setup: Create a CI/CD pipeline in Jenkins and configure it to poll the respective GitHub repository every 2 minutes(we can give any time interval) and if a new commit is identified while polling, triggers the pipeline

### 📎 Outputs

✅ A running EC2 instance with Docker installed

✅ A deployed web application accessible via:
http://your-ec2-public-ip:3000/

✅ A fully automated Jenkins CI/CD pipeline
