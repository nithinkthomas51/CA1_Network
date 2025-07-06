pipeline {
  agent any

  environment {
    DOCKER_CRED = credentials('dockerhub_credentials')
    AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    TF_VAR_key_pair_name = 'nith_key'
  }

  stages {
    stage('Clone_Repository') {
      steps {
        git url: 'https://github.com/nithinkthomas51/CA1_Network.git', branch: 'main'
      }
    }

  stage('Build_and_Push_Docker_Image') {
      steps {
        script {
          def imageName = "nith51/node_app:latest"
          sh """
            echo $DOCKER_CRED_PSW | docker login -u $DOCKER_CRED_USR --password-stdin
            docker build -t $imageName .
            docker push $imageName
            docker logout
          """
        }
      }
    }

    stage('Terraform_Init') {
      steps {
        dir('terraform') {
	  sh 'terraform init'
	}
      }
    }

    stage('Terraform_Apply') {
      steps {
        dir('terraform') {
	  def planOutput = sh(script: 'terraform plan -detailed-exitcode -var="key_pair_name=${TF_VAR_key_pair_name}" -var="ssh_cidr=${TF_VAR_ssh_cidr}" > tfplan.out || true', returnStatus: true)
	  if (planOutput == 2) {
	    echo 'Terraform changes detected. Running apply...'
	    sh 'terraform apply -auto-approve -var="key_pair_name=${TF_VAR_key_pair_name}" -var="ssh_cidr=0.0.0.0/0"'
	  } else if (planOutput == 0) {
	      echo 'No terraform changes detected. Skipping apply...'
	  } else {
	      error 'Terraform plan failed'
	  }
        }
      }
    }

    stage('Get_EC2_IP') {
      steps {
        script {
          def ec2Ip = sh(
            script: 'terraform -chdir=terraform output -raw ec2_public_ip',
            returnStdout: true
          ).trim()
          env.EC2_IP = ec2Ip
        }
      }
    }

    stage('Prepare_Ansible_Inventory') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'ec2_private_key', keyFileVariable: 'KEY_FILE')]) {
          sh """
            echo "[app]
            ${EC2_IP}

            [app:vars]
            ansible_user=ubuntu
            " > ansible/hosts.ini
          """
        }
      }
    }

    stage('Wait for EC2') {
     steps {
       script {
         echo "Waiting 60 seconds for EC2 to be ready"
         sleep(time: 60, unit: 'SECONDS')
       }
     }
   } 

    stage('Run_Ansible_Playbook') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'ec2_private_key', keyFileVariable: 'EC2_KEY')]) {
          sh '''
            export ANSIBLE_HOST_KEY_CHECKING=False
	    echo "Using key: $EC2_KEY"
	    chmod 600 $EC2_KEY
	    ls -l $EC2_KEY
            ansible-playbook -i ansible/hosts.ini ansible/deploy_app.yml \
              --extra-vars "dockerhub_username=$DOCKER_CRED_USR dockerhub_password=$DOCKER_CRED_PSW" \
	      --private-key $EC2_KEY
          '''
        }
      }
    }
  }
}

