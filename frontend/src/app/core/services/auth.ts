import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/auth'; // Proxy to http://localhost:8080/auth
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  // --- Auth Actions ---

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text' });
  }

  updateUser(currentEmail: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${currentEmail}`, data, { responseType: 'text' });
  }

  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${email}`, { responseType: 'text' });
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- Token Management ---

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.loadUserFromToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // --- Helper ---

  private loadUserFromToken() {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Assuming token has "role" and "sub" (email)
        this.currentUserSubject.next({
          email: decoded.sub,
          role: decoded.role,
          ...decoded
        });
      } catch (e) {
        console.error('Invalid token', e);
        this.logout();
      }
    } else {
      this.currentUserSubject.next(null);
    }
  }

  getRole(): string | null {
    return this.currentUserSubject.value ? this.currentUserSubject.value.role : null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
