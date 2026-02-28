# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud CLI** installed and configured
   ```bash
   gcloud auth login
   gcloud config set project append-326010
   ```

2. **Docker** installed and running

3. **Enable required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

4. **Configure Docker for GCR**
   ```bash
   gcloud auth configure-docker
   ```

## Deployment Methods

### Method 1: Using the Deployment Script

1. Load your environment variables:
   ```bash
   export WHATSAPP_GROUP_ID="your-group-id"
   export GEMINI_API_KEY="your-gemini-key"
   export FIREBASE_PROJECT_ID="append-326010"
   export FIREBASE_CLIENT_EMAIL="your-firebase-email"
   export FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   export OPENAI_API_KEY="your-openai-key"
   ```

2. Run the deployment script:
   ```bash
   ./deploy-cloudrun.sh
   ```

### Method 2: Manual Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t gcr.io/append-326010/auto-whatsapp .
   ```

2. **Test locally (optional):**
   ```bash
   docker run -p 8080:8080 --env-file .env gcr.io/append-326010/auto-whatsapp
   ```

3. **Push to Google Container Registry:**
   ```bash
   docker push gcr.io/append-326010/auto-whatsapp
   ```

4. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy auto-whatsapp \
     --image gcr.io/append-326010/auto-whatsapp \
     --platform managed \
     --region us-central1 \
     --memory 2Gi \
     --cpu 2 \
     --timeout 3600 \
     --min-instances 1 \
     --max-instances 1 \
     --allow-unauthenticated
   ```

5. **Set environment variables via Secret Manager (recommended):**
   ```bash
   # Create secrets
   echo -n "your-api-key" | gcloud secrets create gemini-api-key --data-file=-
   
   # Update Cloud Run service to use secrets
   gcloud run services update auto-whatsapp \
     --update-secrets=GEMINI_API_KEY=gemini-api-key:latest \
     --region us-central1
   ```

## Configuration Notes

### Memory and CPU
- **Memory:** 2Gi (required for Chromium/WhatsApp Web)
- **CPU:** 2 (recommended for better performance)
- **Timeout:** 3600 seconds (1 hour) for long-running WhatsApp operations

### Instance Configuration
- **Min instances:** 1 (keeps the app always running for WhatsApp session)
- **Max instances:** 1 (single instance to maintain WhatsApp session state)

### Port Configuration
Cloud Run automatically sets the `PORT` environment variable to 8080. The application is configured to use this.

## Environment Variables

Set these in Cloud Run (recommended via Secret Manager):
- `WHATSAPP_GROUP_ID` - WhatsApp group ID
- `GEMINI_API_KEY` - Google Gemini API key
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `OPENAI_API_KEY` - OpenAI API key
- `VERCEL` - Set to 0 for Cloud Run

## Persistent Storage (Important)

**Note:** Cloud Run instances are stateless. The `.wwebjs_auth` directory (WhatsApp session) will be lost on container restart.

### Solutions:
1. **Google Cloud Storage Mount** (Recommended)
   - Use Cloud Storage FUSE to persist WhatsApp session
   
2. **Cloud Firestore/Firebase**
   - Store session data in Firestore (requires code modification)

3. **Accept re-authentication**
   - Each deployment requires QR code scan

## Monitoring

View logs:
```bash
gcloud run services logs read auto-whatsapp --region us-central1 --follow
```

## Update Deployment

To update the service:
```bash
./deploy-cloudrun.sh
```

Or manually:
```bash
docker build -t gcr.io/append-326010/auto-whatsapp .
docker push gcr.io/append-326010/auto-whatsapp
gcloud run deploy auto-whatsapp --image gcr.io/append-326010/auto-whatsapp --region us-central1
```

## Troubleshooting

### Chromium Issues
If WhatsApp Web fails to initialize, ensure Chromium dependencies are installed (already included in Dockerfile).

### Session Loss
If the session is lost frequently, consider implementing persistent storage for `.wwebjs_auth`.

### Memory Issues
Increase memory if needed:
```bash
gcloud run services update auto-whatsapp --memory 4Gi --region us-central1
```
