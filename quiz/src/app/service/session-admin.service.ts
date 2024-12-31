import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionAdminService {
  private usernameSubject = new BehaviorSubject<string>('');
  private superUserSubject = new BehaviorSubject<boolean>(false);

  // Observables pour suivre les changements
  username$ = this.usernameSubject.asObservable();
  superUser$ = this.superUserSubject.asObservable();

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  getUsername(): string {
    return this.usernameSubject.getValue();
  }

  setSuperUser(superUser: boolean): void {
    this.superUserSubject.next(superUser);
  }

  getSuperUser(): boolean {
    return this.superUserSubject.getValue();
  }

  clearSession(): void {
    this.usernameSubject.next('');
    this.superUserSubject.next(false);
  }
}
