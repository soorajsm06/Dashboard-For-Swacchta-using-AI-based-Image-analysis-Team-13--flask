import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 20000, // 20 seconds timeout
});

// Log requests and responses for debugging
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Retrieve token from local storage or session
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log("token present", token)
  }
  return config;
});


api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response received from backend:', response);
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        console.error('Unauthorized access - redirecting to login');
        // window.location.href = '/login'; // Optional: Redirect user to login if unauthorized
      }
      console.error(`API Error (Status ${error.response.status}):`, error.response?.data);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const uploadImage = async (imageFile: File): Promise<{ message: string; annotatedImageUrl: string }> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await axios.post(`${API_URL}/api/process-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Expecting { message: string, annotatedImageUrl: string }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to process the image.");
  }
};

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export const authApi = {

  uploadFile : async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await api.post(`/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data; // Return server response
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  ping: async()=> {
    try {
      const response = await api.post('/ping');
      return response.data
    } catch (error) {
      console.error('Server Not Ready:', error);
      throw error;
    }
  },
  login: async (data: LoginData): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/login', data);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  register: async (data: RegisterData): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  runLiveMode : async () => {
    try {
      const response = await api.post(`${API_URL}/live-mode`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Process image upload
  processImage : async (formData: FormData) => {
    return await axios.post(`${API_URL}/process-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Fetch uploaded files
  fetchUploads : async () => {
    return await axios.get(`${API_URL}/uploadFetch`);
  },

  verifyToken : async (): Promise<{ user: User }> => {
    try {
      // Retrieve the token from local storage or another secure place
      const token = localStorage.getItem('token');
      console.log("verify token: ",token)
      if (!token) {
        throw new Error('No token found');
      }
  
      // Set the Authorization header
      const response = await api.get('/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error; // Ensure the error is propagated for handling in the calling code
    }
  },
};

export default api;
