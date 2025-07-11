const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: 'Too many uploads from this IP, please try again later.'
});

app.use('/api/upload', uploadLimiter);
app.use(express.json());

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
});

// Initialize Azure Blob Service Client
const getBlobServiceClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('Azure Storage connection string not found');
  }
  return BlobServiceClient.fromConnectionString(connectionString);
};

// Get or create container
const getContainerClient = async (containerName) => {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Create container if it doesn't exist
  await containerClient.createIfNotExists({
    access: 'blob'
  });
  
  return containerClient;
};

// API Routes

// Get list of containers
app.get('/api/containers', async (req, res) => {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containers = [];
    
    for await (const container of blobServiceClient.listContainers()) {
      containers.push({
        name: container.name,
        lastModified: container.properties.lastModified
      });
    }
    
    res.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
});

// Create new container
app.post('/api/containers', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !/^[a-z0-9-]+$/.test(name)) {
      return res.status(400).json({ 
        error: 'Container name must contain only lowercase letters, numbers, and hyphens' 
      });
    }
    
    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient(name);
    
    await containerClient.create({
      access: 'blob'
    });
    
    res.json({ message: 'Container created successfully', name });
  } catch (error) {
    console.error('Error creating container:', error);
    if (error.statusCode === 409) {
      res.status(409).json({ error: 'Container already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create container' });
    }
  }
});

// Upload file to specific container
app.post('/api/upload/:containerName', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { containerName } = req.params;
    const { originalname, buffer, mimetype, size } = req.file;
    
    // Generate unique filename
    const fileExtension = originalname.split('.').pop();
    const uniqueFilename = `${uuidv4()}-${originalname}`;
    
    // Get container client
    const containerClient = await getContainerClient(containerName);
    
    // Create blob client
    const blobClient = containerClient.getBlockBlobClient(uniqueFilename);
    
    // Upload file
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mimetype
      },
      metadata: {
        originalName: originalname,
        uploadDate: new Date().toISOString(),
        fileSize: size.toString()
      }
    });
    
    res.json({
      message: 'File uploaded successfully',
      filename: uniqueFilename,
      originalName: originalname,
      url: blobClient.url,
      size: size,
      container: containerName
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get files in a container
app.get('/api/containers/:containerName/files', async (req, res) => {
  try {
    const { containerName } = req.params;
    const containerClient = await getContainerClient(containerName);
    
    const files = [];
    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      files.push({
        name: blob.name,
        originalName: blob.metadata?.originalName || blob.name,
        lastModified: blob.properties.lastModified,
        size: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        url: `${containerClient.url}/${blob.name}`
      });
    }
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete file from container
app.delete('/api/containers/:containerName/files/:filename', async (req, res) => {
  try {
    const { containerName, filename } = req.params;
    const containerClient = await getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(filename);
    
    await blobClient.delete();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});