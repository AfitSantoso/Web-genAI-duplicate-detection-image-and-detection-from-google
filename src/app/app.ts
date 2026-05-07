import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';
import { AuthFacade } from './core/facades/auth.facade';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    @if (auth.isAuthenticated()) {
      <app-navbar />
    }
    <main>
      <router-outlet />
    </main>
    <app-toast />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
    }
  `],
})
export class App {
  readonly auth = inject(AuthFacade);
}
