import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthCustomService {
  private baseUrl = `${environment.apiUrl}/api/${environment.apiVersion}/users`;
  
  // Using Angular Signals for state management
  private authToken = signal<string | null>(localStorage.getItem('auth_token'));
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isAdminSignal = signal<boolean>(false);
  
  // Expose read-only signals
  readonly token = this.authToken.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly isAdmin = this.isAdminSignal.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeFromToken();
  }

  private initializeFromToken(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          this.logout();
          return;
        }
        
        const user: User = {
          id: decodedToken.id,
          email: decodedToken.email,
          role: decodedToken.role
        };
        
        this.authToken.set(token);
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
        this.isAdminSignal.set(user.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { email, password, role: 'user' })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.authToken.set(null);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.isAdminSignal.set(false);
    this.router.navigate(['/']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.token) {
      localStorage.setItem('auth_token', response.token);
      this.authToken.set(response.token);
      this.currentUserSignal.set(response.user);
      this.isAuthenticatedSignal.set(true);
      this.isAdminSignal.set(response.user.role === 'admin');
    }
  }

  getAuthorizationHeader(): string {
    return `Bearer ${this.authToken()}`;
  }
}
