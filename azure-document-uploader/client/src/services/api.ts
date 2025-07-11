import axios, { AxiosProgressEvent } from 'axios';
import { Container, UploadedFile, UploadResponse, UploadProgress } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || '' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 300000, // 5 minutes for large file uploads
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Get all containers
  async getContainers(): Promise<Container[]> {
    const response = await api.get<Container[]>('/containers');
    return response.data;
  },

  // Create new container
  async createContainer(name: string): Promise<{ message: string; name: string }> {
    const response = await api.post('/containers', { name });
    return response.data;
  },

  // Upload file to container
  async uploadFile(
    containerName: string, 
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>(
      `/upload/${containerName}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  },

  // Get files in container
  async getFiles(containerName: string): Promise<UploadedFile[]> {
    const response = await api.get<UploadedFile[]>(`/containers/${containerName}/files`);
    return response.data;
  },

  // Delete file from container
  async deleteFile(containerName: string, filename: string): Promise<{ message: string }> {
    const response = await api.delete(`/containers/${containerName}/files/${filename}`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiService;