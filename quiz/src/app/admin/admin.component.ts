import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionAdminService} from '../service/session-admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  login: string = '';
  superUser: boolean = false;

  constructor(
    private sessionAdmin: SessionAdminService
  )
  {
    this.login = sessionAdmin.getUsername();
    this.superUser = sessionAdmin.getSuperUser();
  }
}
