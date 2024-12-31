import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private address = 'localhost'; // Adresse du serveur
  private port = 3000; // Port du serveur
  private baseUrl = `http://${this.address}:${this.port}/api`;

  constructor(private http: HttpClient) { }

  submitQuestion(QuestionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/question/add`, QuestionData);
  }
  
  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/question/*`);
  }
}