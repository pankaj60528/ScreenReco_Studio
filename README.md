# Screen Recording MVP

A professional Next.js application for screen recording with video trimming and sharing capabilities.

## 🚀 Features

### Core Functionality
- **Screen Recording**: Capture screen + microphone using MediaRecorder API
- **Video Trimming**: Real-time video trimming with FFmpeg.wasm
- **Multiple Formats**: Export as WebM or MP4
- **Cloud Storage**: Upload to AWS S3 or Cloudflare R2
- **Public Sharing**: Generate shareable links with analytics
- **Video Management**: List, view, and delete recordings

### Analytics
- View count tracking
- Watch completion percentage
- Persistent data storage

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Video Processing**: FFmpeg.wasm for client-side trimming

### Backend
- **API Routes**: Next.js API routes
- **Storage**: JSON-based database (upgradeable to PostgreSQL)
- **File Storage**: AWS S3 / Cloudflare R2 / Local fallback
- **Analytics**: Custom tracking system

### Key Architecture Decisions

#### 1. Client-Side Video Processing
```typescript
// Why FFmpeg.wasm?
- No server load for trimming
- Faster user experience
- Reduced infrastructure costs
- Works offline after initial load