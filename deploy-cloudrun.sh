#!/bin/bash

# Cloud Run deployment script for auto-whatsapp

# Configuration
PROJECT_ID="append-326010"  # Your Firebase project ID
SERVICE_NAME="auto-whatsapp"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --min-instances 1 \
  --max-instances 1 \
  --set-env-vars VERCEL=0 \
  --set-env-vars WHATSAPP_GROUP_ID="${WHATSAPP_GROUP_ID}" \
  --set-env-vars GEMINI_API_KEY="${GEMINI_API_KEY}" \
  --set-env-vars FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID}" \
  --set-env-vars FIREBASE_CLIENT_EMAIL="${FIREBASE_CLIENT_EMAIL}" \
  --set-env-vars FIREBASE_PRIVATE_KEY="${FIREBASE_PRIVATE_KEY}" \
  --set-env-vars OPENAI_API_KEY="${OPENAI_API_KEY}" \
  --allow-unauthenticated

echo "Deployment complete!"
