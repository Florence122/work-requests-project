import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'work-request-frontend';
  isAuthenticated = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.checkAuth());
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    });
  }
}