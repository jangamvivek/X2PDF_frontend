import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Check if user is already logged in from localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.logout();
        }
      }
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  login(userData: User): void {
    // Store user data
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('access_token', userData.token);
    }
    this.currentUserSubject.next(userData);
  }

  logout(): void {
    // Clear user data
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  // Google OAuth callback handler
  handleGoogleCallback(code: string): void {
    // In a real implementation, you would exchange the code for tokens
    // For now, we'll simulate a successful login
    const mockUser: User = {
      email: 'user@gmail.com',
      name: 'Google User',
      token: 'google-token-' + Date.now()
    };
    
    this.login(mockUser);
  }

  // Check if user has valid session
  checkAuthStatus(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = localStorage.getItem('user');
    
    if (!isLoggedIn || !user) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Get user token for API calls
  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }
}
