import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthGoogleService } from '../../../services/auth-google.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {

  private authGoogleService = inject(AuthGoogleService);

  public logOut() {
    this.authGoogleService.logout();
  }

}
