import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/user'; // URL de l'API

  constructor(private http: HttpClient) {}

  login(login: string, password: string): Observable<boolean> {
    const body = { login, password };
    return this.http.post<boolean>(`${this.baseUrl}/login`, body);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, user);
  }

  editUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/edit`, user);
  }

  deleteUser(login: string, password: string): Observable<any> {
    const body = { login, password };
    return this.http.post(`${this.baseUrl}/delete`, body);
  }
}
