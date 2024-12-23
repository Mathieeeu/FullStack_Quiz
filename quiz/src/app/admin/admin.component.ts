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
  tabs: string[] = ['Mon compte', 'Droit Super Admin', 'Supprimer parties'];
  currentTab: number = 0;

  constructor(
    private sessionAdmin: SessionAdminService
  )
  {
    this.login = sessionAdmin.getUsername();
    this.superUser = sessionAdmin.getSuperUser();
  }

  // Les données du formulaire
  formData: any = {
    questionText: '',
    answerText: '',
    themeText: '',
    difficulty: ''
  };

  // Changer d'onglet
  showTab(index: number): void {
    this.currentTab = index;
  }

  onSubmit(): void {
    console.log('Données du formulaire:', this.formData);
  }
  
}