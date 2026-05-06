import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserKey = 'currentUser';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.currentUserKey, JSON.stringify(response));
        }
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap((updatedUser) => {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.userId === id) {
          currentUser.username = updatedUser.username;
          localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem(this.currentUserKey);
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        // Force logout if old legacy session without userId is found
        if (!user.userId) {
          this.logout();
          return null;
        }
        return user;
      }
      return null;
    } catch (e) {
      console.error('Failed to parse user from local storage', e);
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
