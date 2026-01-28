# S3 Setup Guide for ScreenRec

## Quick Setup

### 1. AWS S3 Setup

1. **Create S3 Bucket:**
   - Go to AWS Console → S3 → Create bucket
   - Choose a globally unique bucket name
   - Select your region
   - Block "Block all public access" (we'll handle this with bucket policy)

2. **Configure Bucket Policy:**
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::your-bucket-name/*"
           }
       ]
   }
   ```

3. **Configure CORS:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
       <CORSRule>
           <AllowedOrigin>*</AllowedOrigin>
           <AllowedMethod>GET</AllowedMethod>
           <AllowedMethod>POST</AllowedMethod>
           <AllowedHeader>*</AllowedHeader>
       </CORSRule>
   </CORSConfiguration>
   ```

4. **Create IAM User:**
   - Go to IAM → Users → Create user
   - Attach policy: `AmazonS3FullAccess` (or create custom policy with specific permissions)
   - Save the Access Key ID and Secret Access Key

### 2. Environment Configuration

Create `.env.local` in your project root:

```env
# S3 Configuration
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional: Custom S3 endpoint (for R2, MinIO, etc.)
S3_ENDPOINT=https://accountid.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://bucket.accountid.r2.cloudflarestorage.com

# Optional: Override base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Cloudflare R2 Alternative

If you prefer Cloudflare R2:

1. Create R2 bucket in Cloudflare dashboard
2. Get your R2 API credentials
3. Use this configuration:

```env
S3_BUCKET=your-r2-bucket
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
S3_ENDPOINT=https://accountid.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://pub-xxxxxxxxx.r2.dev
```

### 4. Testing

1. Restart your development server
2. Record a video
3. Try uploading - check browser console for logs
4. Videos should appear in your S3 bucket

### 5. Troubleshooting

**Upload fails with CORS error:**
- Check your bucket CORS configuration
- Ensure the bucket policy allows public read access

**Videos not accessible:**
- Verify the bucket policy
- Check if S3_PUBLIC_URL is correctly set
- Try accessing the video URL directly

**Local storage fallback:**
- If S3 is not configured, videos are saved to `public/uploads/`
- Check this directory if uploads seem to disappear

## Current Status

✅ **S3 Upload**: Implemented with fallback to local storage
✅ **Video Format Support**: Enhanced with multiple codec options
✅ **Error Handling**: Comprehensive error messages and recovery
✅ **Trimming**: FFmpeg.wasm integration with fallbacks
✅ **Share Links**: Generated automatically after upload

## Where Videos Are Saved

- **With S3**: In your configured S3 bucket (e.g., `s3://your-bucket/abc123-recording.webm`)
- **Without S3**: In `public/uploads/` directory locally
- **Share Links**: Format: `http://localhost:3000/watch/abc12345`

## Video Access

Videos are accessible via:
1. Share link generated after upload
2. `/videos` page to manage all recordings
3. Direct S3 URL (if using S3)
