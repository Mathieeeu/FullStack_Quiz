import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionAdminService {
  private username: string = '';
  private superUser: boolean = false;

  setUsername(username: string): void {
    this.username = username;
  }

  getUsername(): string {
    return this.username;
  }

  setSuperUser(superUser: boolean): void {
    this.superUser = superUser;
  }

  getSuperUser(): boolean {
    return this.superUser;
  }

  clearSession(): void {
    this.username = '';
    this.superUser = false;
  }
}