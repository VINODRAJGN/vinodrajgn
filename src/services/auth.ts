import { User } from '../types';

const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin' },
  { id: '2', username: 'upload', role: 'upload' },
  { id: '3', username: 'guest', role: 'guest' }
];

const mockCredentials = {
  admin: 'admin',
  upload: 'upload',
  guest: 'guest'
};

export class AuthService {
  async login(username: string, password: string): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockCredentials[username as keyof typeof mockCredentials] === password) {
      const user = mockUsers.find(u => u.username === username);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();