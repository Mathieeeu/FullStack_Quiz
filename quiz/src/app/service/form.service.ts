import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  submitForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/form`, formData);
  }

  getForms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/forms`);
  }
}