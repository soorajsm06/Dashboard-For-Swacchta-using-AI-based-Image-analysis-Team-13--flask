import { create } from "zustand";
import { authApi } from "../services/api";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  uploadStatus: "Success" | "Failed" | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUploadStatus: (status: "Success" | "Failed" | null) => void;
  ping: () => Promise<void>;
  uploadFile: (file: File) => Promise<any>;
  resetState: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  uploadStatus: null,

  // Reset state to initial values
  resetState: () => set({ user: null, isAuthenticated: false, isLoading: false, uploadStatus: null }),

  // Set upload status
  setUploadStatus: (status) => set({ uploadStatus: status }),

  // Upload file with status tracking
  uploadFile: async (file: File) => {
    try {
      const response = await authApi.uploadFile(file); // Call API function
      set({ uploadStatus: response ? "Success" : "Failed" });
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      set({ uploadStatus: "Failed" });
      throw error;
    }
  },

  // Ping the server with retry logic
  ping: async () => {
    const retryInterval = 5000; // Retry every 5 seconds
    const maxRetries = 5; // Max retry count
    let retryCount = 0;

    const checkServerReady = async () => {
      try {
        const response = await authApi.ping();
        if (response.status === "ok" && response.message === "Server is ready") {
          set({ isLoading: false });
          console.log("Server is ready!");
        } else {
          throw new Error("Server not ready");
        }
      } catch (error) {
        retryCount++;
        console.error(`Ping error (attempt ${retryCount}):`, error);
        if (retryCount < maxRetries) {
          setTimeout(checkServerReady, retryInterval);
        } else {
          console.error("Max retries reached. Server might be down.");
          set({ isLoading: false });
        }
      }
    };

    checkServerReady();
  },

  // Login the user
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem("token", response.token);
      set({ user: response.user, isAuthenticated: true });
      console.log("User logged in:", response.user);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please check your credentials.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Register the user
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register({ name, email, password });
      localStorage.setItem("token", response.token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error("Register error:", error);
      throw new Error("Registration failed. Please try again later.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout the user
  logout: () => {
    localStorage.removeItem("token");
    useAuthStore.getState().resetState();
    console.log("User logged out.");
  },

  // Check if user is authenticated
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }
      const response = await authApi.verifyToken();
      set({ user: response.user, isAuthenticated: true });
      console.log("User authenticated:", response.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token"); // Clear token on error
      useAuthStore.getState().resetState();
    } finally {
      set({ isLoading: false });
    }
  },
}));
