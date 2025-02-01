export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  session: any | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
} 