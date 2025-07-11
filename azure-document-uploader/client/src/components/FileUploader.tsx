import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from 'react-query';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Close,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { UploadProgress } from '../types';

interface FileUploadState {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploaderProps {
  containerName: string;
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  containerName,
  onUploadSuccess,
  onUploadError,
}) => {
  const [uploadQueue, setUploadQueue] = useState<FileUploadState[]>([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation(
    async ({ file, onProgress }: { file: File; onProgress: (progress: UploadProgress) => void }) => {
      return apiService.uploadFile(containerName, file, onProgress);
    }
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: FileUploadState[] = acceptedFiles.map(file => ({
      file,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      status: 'pending',
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);

    // Start uploading files one by one
    newUploads.forEach((upload, index) => {
      setTimeout(() => {
        handleFileUpload(upload.file);
      }, index * 100); // Slight delay between uploads
    });
  }, [containerName]);

  const handleFileUpload = async (file: File) => {
    setUploadQueue(prev => 
      prev.map(item => 
        item.file === file 
          ? { ...item, status: 'uploading' }
          : item
      )
    );

    try {
      await uploadMutation.mutateAsync({
        file,
        onProgress: (progress) => {
          setUploadQueue(prev => 
            prev.map(item => 
              item.file === file 
                ? { ...item, progress }
                : item
            )
          );
        }
      });

      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'success' }
            : item
        )
      );

      // Refresh the file list
      queryClient.invalidateQueries(['files', containerName]);
      onUploadSuccess();

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Upload failed';
      
      setUploadQueue(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error', error: errorMessage }
            : item
        )
      );

      onUploadError(errorMessage);
    }
  };

  const removeFromQueue = (file: File) => {
    setUploadQueue(prev => prev.filter(item => item.file !== file));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileUploadState['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InsertDriveFile color="action" />;
    }
  };

  const getStatusColor = (status: FileUploadState['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'uploading':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Upload Files to "{containerName}"
        </Typography>

        <Box
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''}`}
          sx={{
            border: '2px dashed',
            borderColor: isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragReject ? 'error.light' : isDragActive ? 'primary.light' : 'grey.50',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.light',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          {isDragReject ? (
            <Typography color="error">
              Some files are not supported. Please upload valid document or image files.
            </Typography>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports: PDF, Word, Excel, PowerPoint, Images, Text files (max 100MB each)
              </Typography>
            </>
          )}
        </Box>

        {uploadQueue.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Upload Queue
            </Typography>
            <List>
              {uploadQueue.map((upload, index) => (
                <ListItem key={`${upload.file.name}-${index}`} divider>
                  <ListItemIcon>
                    {getStatusIcon(upload.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {upload.file.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={upload.status}
                          color={getStatusColor(upload.status) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(upload.file.size)}
                        </Typography>
                        {upload.status === 'uploading' && (
                          <Box mt={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={upload.progress.percentage}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {upload.progress.percentage}% uploaded
                            </Typography>
                          </Box>
                        )}
                        {upload.status === 'error' && upload.error && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {upload.error}
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                  {(upload.status === 'pending' || upload.status === 'error') && (
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFromQueue(upload.file)}
                      size="small"
                    >
                      <Close />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;