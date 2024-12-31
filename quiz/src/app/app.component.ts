import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from "./footer/footer.component";
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, 
    HeaderComponent,
    FooterComponent,
    HttpClientModule,
    FormsModule,
 ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'quiz';
}
