import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar></app-navbar>
    <main class="page-wrapper">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrls: ['./app.css']
})
export class App {
}
