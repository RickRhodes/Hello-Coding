import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  Snackbar,
} from '@mui/material';
import { CloudUpload, Storage } from '@mui/icons-material';
import ContainerManager from './components/ContainerManager';
import FileUploader from './components/FileUploader';
import FileViewer from './components/FileViewer';
import './App.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleContainerSelect = (containerName: string) => {
    setSelectedContainer(containerName);
    setActiveTab(1); // Switch to upload tab
  };

  return (
    <div className="App">
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Storage sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Azure Document Uploader
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="upload tabs">
            <Tab
              icon={<Storage />}
              label="Containers"
              iconPosition="start"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<CloudUpload />}
              label="Upload"
              iconPosition="start"
              sx={{ textTransform: 'none' }}
              disabled={!selectedContainer}
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ContainerManager
            onContainerSelect={handleContainerSelect}
            onNotification={showNotification}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {selectedContainer ? (
            <>
              <FileUploader
                containerName={selectedContainer}
                onUploadSuccess={() => showNotification('File uploaded successfully!', 'success')}
                onUploadError={(error) => showNotification(error, 'error')}
              />
              <Box sx={{ mt: 4 }}>
                <FileViewer
                  containerName={selectedContainer}
                  onNotification={showNotification}
                />
              </Box>
            </>
          ) : (
            <Alert severity="info">
              Please select a container from the Containers tab to start uploading files.
            </Alert>
          )}
        </TabPanel>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;