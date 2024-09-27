import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccueilComponent } from './accueil/accueil.component';
import { JeuComponent } from './jeu/jeu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './admin/admin.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { SalleAttenteComponent } from './salle-attente/salle-attente.component';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'jeu', component: JeuComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'salle-attente', component: SalleAttenteComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }