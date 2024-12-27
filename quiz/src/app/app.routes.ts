import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccueilComponent } from './accueil/accueil.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './admin/admin.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { LobbyComponent } from './lobby/lobby.component';
import { GameComponent } from './game/game.component';
import {AjoutQuestionComponent} from './ajout-question/ajout-question.component';
import { CreationPartieComponent } from './creation-partie/creation-partie.component';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'lobby/:code', component: LobbyComponent},
  { path: 'game/:code', component: GameComponent },
  { path: 'ajout-question', component: AjoutQuestionComponent },
  { path: 'creation-partie', component: CreationPartieComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] })

export class AppRoutingModule { }