import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  StudentRegistrationData,
  ProfessorRegistrationData,
  AuthContextType 
} from '../types/auth';
import { 
  validateCredentials, 
  createUser, 
  getUserById,
  createSession,
  validateSession,
  removeSession
} from '../lib/userStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate credentials against stored users
      const user = validateCredentials(credentials.email, credentials.password, credentials.role);
      
      if (!user) {
        throw new Error('Invalid credentials for selected role');
      }
      
      // Create session and store user
      const sessionId = createSession(user);
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('sessionId', sessionId);
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new admin user
      const newUser = createUser({
        email: credentials.email,
        password: credentials.password,
        role: 'admin',
        name: credentials.name,
        department: credentials.department,
      });
      
      // Log in the new user
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: StudentRegistrationData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new student user
      const newUser = createUser({
        email: data.email,
        password: data.password,
        role: 'student',
        name: data.name,
        department: data.department,
      });
      
      console.log('Student registered successfully:', { ...newUser, password: '[HIDDEN]' });
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerProfessor = async (data: ProfessorRegistrationData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new professor user
      const newUser = createUser({
        email: data.email,
        password: data.password,
        role: 'professor',
        name: data.name,
        department: data.department,
      });
      
      console.log('Professor registered successfully:', { ...newUser, password: '[HIDDEN]' });
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      removeSession(sessionId);
      localStorage.removeItem('sessionId');
    }
    
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    registerStudent,
    registerProfessor,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
