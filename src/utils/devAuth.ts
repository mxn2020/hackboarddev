// Development auth service for StackBlitz compatibility
// This simulates the backend auth functionality using localStorage

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    menuLayout?: string;
    [key: string]: unknown;
  };
}

interface UserWithPassword extends User {
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const DEV_USERS_KEY = 'dev_users';

// Simulate JWT token creation
function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  return btoa(JSON.stringify(payload));
}

// Simulate JWT token verification
function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expired
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return null;
  }
}

// Get all users from localStorage
function getUsers(): Record<string, UserWithPassword> {
  const users = localStorage.getItem(DEV_USERS_KEY);
  return users ? JSON.parse(users) : {};
}

// Save users to localStorage
function saveUsers(users: Record<string, UserWithPassword>): void {
  localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));
}

// Find user by email
function findUserByEmail(email: string): User | null {
  const users = getUsers();
  return Object.values(users).find(user => user.email === email) || null;
}

// Simple password hashing simulation (NOT for production!)
function hashPassword(password: string): string {
  return btoa(password); // Base64 encoding - only for development!
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

export const devAuth = {
  async register(email: string, password: string, username: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getUsers();

          // Check if user already exists
          if (findUserByEmail(email)) {
            reject(new Error('User already exists with this email'));
            return;
          }

          // Create new user
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const user: User = {
            id: userId,
            username,
            name: username,
            email,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Store user with hashed password
          const userWithPassword = {
            ...user,
            password: hashPassword(password)
          };

          users[userId] = userWithPassword;
          saveUsers(users);

          // Create token
          const token = createToken(user);

          resolve({ user, token });
        } catch {
          reject(new Error('Registration failed'));
        }
      }, 500); // Simulate network delay
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = findUserByEmail(email);

          if (!user) {
            reject(new Error('Invalid credentials'));
            return;
          }

          const userWithPassword = getUsers()[user.id];
          if (!verifyPassword(password, userWithPassword.password)) {
            reject(new Error('Invalid credentials'));
            return;
          }

          // Create token
          const token = createToken(user);

          resolve({ user, token });
        } catch {
          reject(new Error('Login failed'));
        }
      }, 500); // Simulate network delay
    });
  },

  async getMe(token: string): Promise<{ user: User }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const decoded = verifyToken(token);
          if (!decoded) {
            reject(new Error('Invalid token'));
            return;
          }

          const users = getUsers();
          const user = users[decoded.userId];

          if (!user) {
            reject(new Error('User not found'));
            return;
          }

          // Remove password from response
          const userWithoutPassword: User = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            preferences: user.preferences
          };
          resolve({ user: userWithoutPassword });
        } catch {
          reject(new Error('Failed to get user'));
        }
      }, 300);
    });
  },

  async updateProfile(token: string, userData: Partial<User>): Promise<{ user: User }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const decoded = verifyToken(token);
          if (!decoded) {
            reject(new Error('Invalid token'));
            return;
          }

          const users = getUsers();
          const user = users[decoded.userId];

          if (!user) {
            reject(new Error('User not found'));
            return;
          }

          // Update user
          const updatedUser = {
            ...user,
            name: userData.name || user.name,
            email: userData.email || user.email,
            preferences: userData.preferences || user.preferences,
            updatedAt: new Date().toISOString()
          };

          users[decoded.userId] = updatedUser;
          saveUsers(users);

          // Remove password from response
          const userWithoutPassword: User = {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            preferences: updatedUser.preferences
          };
          resolve({ user: userWithoutPassword });
        } catch {
          reject(new Error('Failed to update profile'));
        }
      }, 400);
    });
  },

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, we might blacklist the token
        resolve();
      }, 200);
    });
  }
};
