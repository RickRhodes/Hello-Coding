export interface Container {
  name: string;
  lastModified: string;
}

export interface UploadedFile {
  name: string;
  originalName: string;
  lastModified: string;
  size: number;
  contentType: string;
  url: string;
}

export interface UploadResponse {
  message: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  container: string;
}

export interface ApiError {
  error: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}