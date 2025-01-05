import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER_CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = SERVER_CONFIG.userUrl;

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer le statut superUser
  getSuperUser(login: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/superuser`, {params: { login } });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  login(login: string, password: string): Observable<boolean> {
    const body = { login, password };
    return this.http.post<boolean>(`${this.baseUrl}/login`, body);
  }

  register(login: string, password: string, superuser: boolean): Observable<boolean> {
    const user = { login, password, superuser };
    return this.http.post<boolean>(`${this.baseUrl}/add`, user);
  }

  editUser(user: any, action: string, newUsername?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/edit`, { user, action, newUsername });
  }

  deleteUser(login: string, password?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete`, { login, password });
  }
}
