// Common types used throughout the application

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  user: User | null;
  currentProject: Project | null;
  isLoading: boolean;
}
