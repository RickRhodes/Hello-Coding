import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  InsertDriveFile,
  Download,
  Delete,
  Refresh,
  OpenInNew,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { UploadedFile } from '../types';

interface FileViewerProps {
  containerName: string;
  onNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  containerName,
  onNotification,
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    file: UploadedFile | null;
  }>({ open: false, file: null });

  const queryClient = useQueryClient();

  // Fetch files in container
  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery<UploadedFile[]>(
    ['files', containerName],
    () => apiService.getFiles(containerName),
    {
      enabled: !!containerName,
      onError: () => {
        onNotification('Failed to fetch files', 'error');
      },
    }
  );

  // Delete file mutation
  const deleteMutation = useMutation(
    ({ filename }: { filename: string }) => 
      apiService.deleteFile(containerName, filename),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['files', containerName]);
        setDeleteDialog({ open: false, file: null });
        onNotification('File deleted successfully', 'success');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to delete file';
        onNotification(message, 'error');
      },
    }
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return '🖼️';
    } else if (contentType.includes('pdf')) {
      return '📄';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      return '📝';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      return '📊';
    } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
      return '📈';
    }
    return '📎';
  };

  const getFileTypeChip = (contentType: string) => {
    let label = 'File';
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

    if (contentType.startsWith('image/')) {
      label = 'Image';
      color = 'info';
    } else if (contentType.includes('pdf')) {
      label = 'PDF';
      color = 'error';
    } else if (contentType.includes('word') || contentType.includes('document')) {
      label = 'Word';
      color = 'primary';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
      label = 'Excel';
      color = 'success';
    } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
      label = 'PowerPoint';
      color = 'warning';
    }

    return <Chip size="small" label={label} color={color} variant="outlined" />;
  };

  const handleDownload = (file: UploadedFile) => {
    window.open(file.url, '_blank');
  };

  const handleDelete = (file: UploadedFile) => {
    setDeleteDialog({ open: true, file });
  };

  const confirmDelete = () => {
    if (deleteDialog.file) {
      deleteMutation.mutate({ filename: deleteDialog.file.name });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading files...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load files from container "{containerName}".
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Files in "{containerName}"
            </Typography>
            <Tooltip title="Refresh file list">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {files.length === 0 ? (
            <Alert severity="info">
              No files found in this container. Upload some files to get started.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {files.length} file{files.length !== 1 ? 's' : ''} total
              </Typography>
              <List>
                {files.map((file) => (
                  <ListItem key={file.name} divider>
                    <ListItemIcon>
                      <Box sx={{ fontSize: 24 }}>
                        {getFileIcon(file.contentType)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="subtitle1" component="span" noWrap>
                            {file.originalName}
                          </Typography>
                          {getFileTypeChip(file.contentType)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(file.size)} • Uploaded {formatDate(file.lastModified)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Download file">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownload(file)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in new tab">
                          <IconButton 
                            size="small" 
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete file">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(file)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, file: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.file?.originalName}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, file: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileViewer;