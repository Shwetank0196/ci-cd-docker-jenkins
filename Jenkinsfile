pipeline {
    agent any
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/Shwetank0196/ci-cd-docker-jenkins.git'
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                sh '''
                    docker compose down || true
                '''
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                    docker compose up -d --build
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "Waiting for containers to start..."
                    sleep 10
                    docker ps
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
