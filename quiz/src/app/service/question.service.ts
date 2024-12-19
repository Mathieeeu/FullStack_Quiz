import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /*
  QuestionSchema : {
      questionText: String,
      answerText: String,
      themeText: String,
      difficulty: String
  }
  */
 // URL : http://localhost:3000/api/question/add
  submitQuestion(QuestionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/question/add`, QuestionData);
  }
  
  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/question/*`);
  }
}