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
          <span class="navbar__logo">🛡️</span>
          <div>
            <span class="navbar__app-name">FRIDAYS</span>
            <span class="navbar__version">v4.0</span>
          </div>
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
            <div class="navbar__user-info">
              <span class="navbar__user-name">{{ auth.userName() }}</span>
              <span class="navbar__user-role">{{ auth.userRole() }}</span>
            </div>
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
      background: var(--color-primary-dark);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar__inner {
      display: flex;
      align-items: center;
      height: 64px;
      gap: 32px;
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__logo {
      font-size: 1.5rem;
    }

    .navbar__app-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-accent);
      letter-spacing: -0.03em;
    }

    .navbar__version {
      display: block;
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 0.05em;
    }

    .navbar__nav {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .navbar__link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
      }

      &.active {
        background: rgba(212, 168, 67, 0.15);
        color: var(--color-accent);
        font-weight: 600;
      }
    }

    .navbar__user {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .navbar__user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .navbar__user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    .navbar__user-role {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--color-accent);
      background: rgba(212, 168, 67, 0.15);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      letter-spacing: 0.04em;
    }

    .navbar__logout {
      font-family: var(--font-family);
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      padding: 6px 14px;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    @media (max-width: 768px) {
      .navbar__nav {
        display: none;
      }

      .navbar__user-name {
        display: none;
      }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthFacade);
}
