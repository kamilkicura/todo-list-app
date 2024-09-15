import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthGoogleService } from '../../services/auth-google.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthGoogleService);

  protected signInWithGoogle(): void {
    this.authService.login();
  }
}
