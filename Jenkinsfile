pipeline {
    agent {
        docker {
            image 'node:lts'
            args '-u root'
        }
    }

    environment {
        DEPLOY_PATH = "/var/projects/resume"
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    corepack enable
                    corepack prepare pnpm@latest --activate
                    pnpm -v
                '''
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
                    mkdir -p $DEPLOY_PATH
                    rm -rf $DEPLOY_PATH/*
                    cp -r dist/* $DEPLOY_PATH/
                '''
            }
        }
    }
}