import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER_CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private baseUrl = SERVER_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  submitQuestion(QuestionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/question/add`, QuestionData);
  }
  
  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/question/*`);
  }
}