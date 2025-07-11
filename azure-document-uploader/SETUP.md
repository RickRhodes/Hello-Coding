# Quick Setup Guide - Azure Document Uploader

## What's Been Built

✅ **Complete Azure Document Uploader Website**
- Modern React frontend with Material-UI design
- Node.js/Express backend with Azure Storage integration
- Drag & drop file upload with progress tracking
- Container management and file browser
- Security features (rate limiting, file validation)

## Features

- 📁 Create and manage Azure Storage containers
- 📤 Upload multiple files with drag & drop
- 📋 View, download, and delete uploaded files
- 🔒 Secure file handling with type validation
- 📱 Responsive design for all devices
- ⚡ Real-time progress tracking

## Quick Start

### 1. Configure Azure Storage

1. Create an Azure Storage Account
2. Get your connection string from Azure Portal
3. Edit `server/.env` and replace the connection string:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 3. Start the Application

```bash
# Run both frontend and backend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## File Structure

```
azure-document-uploader/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
├── server/                # Node.js Express backend
│   ├── index.js          # Main server file
│   └── .env              # Environment configuration
└── README.md             # Full documentation
```

## Supported File Types

- PDF documents
- Microsoft Office files (Word, Excel, PowerPoint)
- Images (JPEG, PNG, GIF)
- Text files

## Security Features

- File type validation
- 100MB size limit per file
- Rate limiting (10 uploads per 15 minutes)
- CORS protection
- Input sanitization

## Next Steps

1. Update the Azure connection string in `server/.env`
2. Run `npm run dev` to start the application
3. Access http://localhost:3000 to begin uploading files

For detailed documentation, see `README.md`.