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

    stage('Terraform_Apply') {
      steps {
        dir('terraform') {
          sh 'terraform init'
          sh 'terraform apply -auto-approve -var="key_pair_name=${TF_VAR_key_pair_name}" -var="ssh_cidr=0.0.0.0/0"'
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
            ansible_ssh_private_key_file=${KEY_FILE}
            " > ansible/hosts.ini
          """
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

