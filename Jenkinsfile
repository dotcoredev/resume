pipeline {
    agent {
        docker {
            image 'node:lts'
        }
    }

    environment {
        DEPLOY_PATH = "/var/projects/resume"
    }

    stages {
        stage('check docker') {
            steps {
                sh 'docker -v'
            }
        }

        stage('Install pnpm') {
            steps {
                sh 'npm install -g pnpm'
            }
        }

        stage('Install') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                sh 'pnpm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    sudo mkdir -p $DEPLOY_PATH
                    sudo rm -rf $DEPLOY_PATH/*
                    sudo cp -r dist/* $DEPLOY_PATH/
                '''
            }
        }
    }
}