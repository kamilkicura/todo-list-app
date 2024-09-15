import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-top-navigation',
  standalone: true,
  imports: [LogoComponent, CalendarComponent, MenuComponent],
  templateUrl: './top-navigation.component.html',
  styleUrl: './top-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopNavigationComponent {

}
