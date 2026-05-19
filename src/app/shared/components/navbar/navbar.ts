import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar__inner container">
        <a class="navbar__brand" routerLink="/">
          <span class="navbar__app-name">FRIDAYS</span>
        </a>

        @if (auth.isAuthenticated()) {
          <div class="navbar__nav">
            @switch (auth.userRole()) {
              @case ('CMO') {
                <a routerLink="/cmo" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar__link">
                  Dashboard
                </a>
                <a routerLink="/cmo/customers" routerLinkActive="active" class="navbar__link">
                  Customers
                </a>
                <a routerLink="/cmo/upload" routerLinkActive="active" class="navbar__link">
                  Upload
                </a>
              }
              @case ('BM') {
                <a routerLink="/bm" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar__link">
                  Dashboard
                </a>
                <a routerLink="/bm/flagged" routerLinkActive="active" class="navbar__link">
                  Flagged
                </a>
                <a routerLink="/bm/cmo-list" routerLinkActive="active" class="navbar__link">
                  CMO List
                </a>
              }
              @case ('AUDIT') {
                <a routerLink="/audit" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar__link">
                  Dashboard
                </a>
                <a routerLink="/audit/cmo-list" routerLinkActive="active" class="navbar__link">
                  CMO Audit
                </a>
              }
            }
          </div>

          <div class="navbar__user">
            <span class="navbar__user-name">{{ auth.userName() }}</span>
            <span class="navbar__user-role">{{ auth.userRole() }}</span>
            <button class="navbar__logout" (click)="auth.logout()">
              Logout
            </button>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar__inner {
      display: flex;
      align-items: center;
      height: 56px;
      gap: 28px;
    }

    .navbar__brand {
      display: flex;
      align-items: baseline;
      gap: 6px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__app-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }

    .navbar__version {
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--color-text-muted);
    }

    .navbar__nav {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
    }

    .navbar__link {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }

      &.active {
        background: var(--color-primary-50);
        color: var(--color-primary);
      }
    }

    .navbar__user {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .navbar__user-name {
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .navbar__user-role {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--color-primary);
      background: var(--color-primary-50);
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }

    .navbar__logout {
      font-family: var(--font-family);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 4px 12px;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
    }

    @media (max-width: 768px) {
      .navbar__nav { display: none; }
      .navbar__user-name { display: none; }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthFacade);
}
