import { User, StudentRegistrationData, ProfessorRegistrationData, RegisterCredentials } from '../types/auth';

// User storage keys
const USERS_KEY = 'learnflow_users';
const SESSIONS_KEY = 'learnflow_sessions';

// Initialize with default admin user if no users exist
const initializeDefaultUsers = (): void => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@learnflow.com',
        password: 'admin123', // In production, this should be hashed
        role: 'admin' as const,
        name: 'System Administrator',
        department: 'School of Computing and Data Science',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

// Get all users from storage
export const getAllUsers = (): User[] => {
  initializeDefaultUsers();
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to storage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Check if email already exists
export const isEmailTaken = (email: string): boolean => {
  const users = getAllUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Create a new user
export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getAllUsers();
  
  // Check if email is already taken
  if (isEmailTaken(userData.email)) {
    throw new Error('Email already registered');
  }
  
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return newUser;
};

// Validate user credentials
export const validateCredentials = (email: string, password: string, role: string): User | null => {
  const users = getAllUsers();
  
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password && 
    u.role === role
  );
  
  return user || null;
};

// Get user by ID
export const getUserById = (id: string): User | null => {
  const users = getAllUsers();
  return users.find(user => user.id === id) || null;
};

// Update user
export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);
  
  return users[userIndex];
};

// Delete user
export const deleteUser = (id: string): boolean => {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) return false;
  
  saveUsers(filteredUsers);
  return true;
};

// Get users by role
export const getUsersByRole = (role: string): User[] => {
  const users = getAllUsers();
  return users.filter(user => user.role === role);
};

// Search users
export const searchUsers = (query: string): User[] => {
  const users = getAllUsers();
  const lowercaseQuery = query.toLowerCase();
  
  return users.filter(user => 
    user.name.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery) ||
    user.department.toLowerCase().includes(lowercaseQuery)
  );
};

// Session management
export const createSession = (user: User): string => {
  const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
  
  sessions[sessionId] = {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return sessionId;
};

export const validateSession = (sessionId: string): User | null => {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
  const session = sessions[sessionId];
  
  if (!session) return null;
  
  // Check if session has expired
  if (new Date() > new Date(session.expiresAt)) {
    delete sessions[sessionId];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return null;
  }
  
  return getUserById(session.userId);
};

export const removeSession = (sessionId: string): void => {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
  delete sessions[sessionId];
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

// Clear all data (useful for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem('user'); // Remove current user session
};
