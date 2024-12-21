import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/user'; // URL de l'API

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer le statut superUser
  getSuperUser(login: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/superuser`, {
      params: { login} 
    });
  }

  login(login: string, password: string): Observable<boolean> {
    const body = { login, password };
    return this.http.post<boolean>(`${this.baseUrl}/login`, body);
  }

  register(login: string, password: string, superuser: boolean): Observable<boolean> {
    const user = { login, password, superuser };
    return this.http.post<boolean>(`${this.baseUrl}/add`, user);
  }

  editUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/edit`, user);
  }

  deleteUser(login: string, password: string): Observable<any> {
    const body = { login, password };
    return this.http.post(`${this.baseUrl}/delete`, body);
  }
}
