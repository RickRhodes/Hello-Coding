import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add,
  FolderOpen,
  Storage,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Container } from '../types';

interface ContainerManagerProps {
  onContainerSelect: (containerName: string) => void;
  onNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const ContainerManager: React.FC<ContainerManagerProps> = ({
  onContainerSelect,
  onNotification,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [nameError, setNameError] = useState('');

  const queryClient = useQueryClient();

  // Fetch containers
  const {
    data: containers = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Container[]>('containers', apiService.getContainers, {
    onError: () => {
      onNotification('Failed to fetch containers', 'error');
    },
  });

  // Create container mutation
  const createContainerMutation = useMutation(
    apiService.createContainer,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('containers');
        setIsCreateDialogOpen(false);
        setNewContainerName('');
        onNotification(`Container "${data.name}" created successfully!`, 'success');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Failed to create container';
        onNotification(message, 'error');
      },
    }
  );

  const validateContainerName = (name: string): string => {
    if (!name) return 'Container name is required';
    if (name.length < 3 || name.length > 63) {
      return 'Container name must be between 3 and 63 characters';
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      return 'Container name must contain only lowercase letters, numbers, and hyphens';
    }
    if (name.startsWith('-') || name.endsWith('-')) {
      return 'Container name cannot start or end with a hyphen';
    }
    if (name.includes('--')) {
      return 'Container name cannot contain consecutive hyphens';
    }
    return '';
  };

  const handleCreateContainer = () => {
    const error = validateContainerName(newContainerName);
    if (error) {
      setNameError(error);
      return;
    }

    createContainerMutation.mutate(newContainerName);
  };

  const handleNameChange = (value: string) => {
    setNewContainerName(value);
    if (nameError) {
      const error = validateContainerName(value);
      setNameError(error);
    }
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading containers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Failed to load containers. Please check your Azure Storage connection.
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Storage Containers
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Container
            </Button>
          </Box>

          {containers.length === 0 ? (
            <Alert severity="info">
              No containers found. Create your first container to start uploading files.
            </Alert>
          ) : (
            <List>
              {containers.map((container) => (
                <ListItem key={container.name} divider>
                  <Storage sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" component="span">
                          {container.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          label="Container" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={`Last modified: ${formatDate(container.lastModified)}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      startIcon={<FolderOpen />}
                      onClick={() => onContainerSelect(container.name)}
                      sx={{ textTransform: 'none' }}
                    >
                      Select
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Container Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Container</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Container Name"
            fullWidth
            variant="outlined"
            value={newContainerName}
            onChange={(e) => handleNameChange(e.target.value)}
            error={!!nameError}
            helperText={nameError || 'Use lowercase letters, numbers, and hyphens only'}
            placeholder="my-documents"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateContainer}
            variant="contained"
            disabled={!!nameError || !newContainerName || createContainerMutation.isLoading}
          >
            {createContainerMutation.isLoading ? (
              <CircularProgress size={20} />
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContainerManager;