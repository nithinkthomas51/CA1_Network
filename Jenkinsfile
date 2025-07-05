pipeline {
    agent any

    environment {
        // AWS credentials from Jenkins (stored as secret text)
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')

        // Docker Hub credentials (username/password pair)
        DOCKER_USER = credentials('dockerhub_credentials').username
        DOCKER_PASS = credentials('dockerhub_credentials').password
    }

    stages {
        stage('Terraform Init and Apply') {
            steps {
                withCredentials([string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                                 string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                      cd terraform
                      terraform init
                      terraform apply -auto-approve -var="key_pair_name=my-key" > ../tf_output.log
                    '''
                }
            }
        }

	stage('Get EC2 IP') {
    	    steps {
                script {
                    env.EC2_IP = sh(script: 'cd terraform && terraform output -raw ec2_public_ip', returnStdout: true).trim()
                    echo "Extracted EC2 IP: ${env.EC2_IP}"
        	}
    	    }
	}


        stage('Prepare Ansible Hosts File') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2_private_key', keyFileVariable: 'KEY_FILE')]) {
                    sh """
                      echo "[app]
                      ${EC2_IP}

                      [app:vars]
                      ansible_user=ubuntu
                      ansible_ssh_private_key_file=${KEY_FILE}
                      " > ansible/hosts.ini
                    """
                }
            }
        }

        stage('Run Ansible Playbook') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub_credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh '''
                      export ANSIBLE_HOST_KEY_CHECKING=False
                      ansible-playbook -i ansible/hosts.ini ansible/deploy_app.yml --extra-vars "dockerhub_username=$DOCKER_USER dockerhub_password=$DOCKER_PASS"
                    '''
                }
            }
        }
    }
}
