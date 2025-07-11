# Azure Document Uploader

A modern web application for uploading documents to Azure Storage containers. Built with React, Node.js, and Material-UI.

## Features

- 📁 **Container Management**: Create and manage Azure Storage containers
- 📤 **Drag & Drop Upload**: Modern file upload interface with progress tracking
- 📋 **File Management**: View, download, and delete uploaded files
- 🔒 **Security**: Rate limiting, file type validation, and size restrictions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: Automatic refresh of file lists after operations

## Supported File Types

- PDF documents (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Microsoft Excel (`.xls`, `.xlsx`)
- Microsoft PowerPoint (`.ppt`, `.pptx`)
- Text files (`.txt`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd azure-document-uploader

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configure Azure Storage

1. Create an Azure Storage Account in the [Azure Portal](https://portal.azure.com)
2. Navigate to "Access keys" and copy the connection string
3. Copy the server environment file:

```bash
cd server
cp .env.example .env
```

4. Edit `.env` and replace the placeholder values:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account_name;AccountKey=your_account_key;EndpointSuffix=core.windows.net
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run the Application

#### Development Mode (both frontend and backend)
```bash
npm run dev
```

#### Run components separately
```bash
# Backend only
npm run server:dev

# Frontend only (in another terminal)
npm run client:dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Project Structure

```
azure-document-uploader/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # App entry point
│   ├── package.json
│   └── tsconfig.json
├── server/                # Node.js backend
│   ├── index.js          # Server entry point
│   ├── package.json
│   └── .env.example      # Environment template
├── package.json          # Root package file
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/containers` | List all containers |
| POST | `/api/containers` | Create new container |
| GET | `/api/containers/:name/files` | List files in container |
| POST | `/api/upload/:name` | Upload file to container |
| DELETE | `/api/containers/:name/files/:filename` | Delete file |
| GET | `/api/health` | Health check |

## Configuration Options

### Server Configuration

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string

### Upload Limits

- **File size**: 100MB maximum per file
- **Rate limiting**: 10 uploads per 15 minutes per IP
- **Concurrent uploads**: Multiple files supported

## Security Features

- File type validation
- File size limits
- Rate limiting
- CORS protection
- Helmet security headers
- Input sanitization

## Deployment

### Frontend (Client)

```bash
cd client
npm run build
```

Deploy the `build` folder to your static hosting service (Azure Static Web Apps, Netlify, Vercel, etc.).

### Backend (Server)

1. Set environment variables in your hosting platform
2. Deploy the `server` folder to your Node.js hosting service (Azure App Service, Heroku, etc.)

### Environment Variables for Production

```env
AZURE_STORAGE_CONNECTION_STRING=your_production_connection_string
PORT=80
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

## Troubleshooting

### Common Issues

1. **"Azure Storage connection string not found"**
   - Ensure the `.env` file exists in the `server` directory
   - Verify the connection string is correct

2. **Files not uploading**
   - Check file size (must be < 100MB)
   - Verify file type is supported
   - Check browser console for errors

3. **CORS errors**
   - Ensure `CLIENT_URL` is set correctly in server `.env`
   - Check if both frontend and backend are running

### Debug Mode

Set `NODE_ENV=development` and check server logs for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Create an issue in the repository
- Review Azure Storage documentation