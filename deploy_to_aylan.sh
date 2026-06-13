#!/bin/bash
# Safe deployment script for BudgetStar to Aylan Server
# Prevents accidental overwriting of the live database

echo "Deploying BudgetStar to Aylan server..."

rsync -avz \
    --exclude 'node_modules' \
    --exclude '.venv' \
    --exclude '.venv_local' \
    --exclude '__pycache__' \
    --exclude '*.db' \
    --exclude '*.db-shm' \
    --exclude '*.db-wal' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.DS_Store' \
    --exclude 'frontend/dist' \
    ./ aylan@100.99.70.10:/home/aylan/BudgetStar/

echo "Rebuilding Docker containers on Aylan..."
ssh aylan@100.99.70.10 "cd /home/aylan/BudgetStar && docker compose up -d --build"

echo "Deployment complete!"
