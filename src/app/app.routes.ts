import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPage),
  },

  // ─── CMO Routes ──────────────────────────────────────
  {
    path: 'cmo',
    canActivate: [roleGuard('CMO')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/cmo/pages/dashboard.page').then(
            (m) => m.CmoDashboardPage
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/cmo/pages/customers.page').then(
            (m) => m.CmoCustomersPage
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/cmo/pages/upload.page').then(
            (m) => m.CmoUploadPage
          ),
      },
    ],
  },

  // ─── BM Routes ───────────────────────────────────────
  {
    path: 'bm',
    canActivate: [roleGuard('BM')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/bm/pages/dashboard.page').then(
            (m) => m.BmDashboardPage
          ),
      },
      {
        path: 'flagged',
        loadComponent: () =>
          import('./features/bm/pages/flagged.page').then(
            (m) => m.BmFlaggedPage
          ),
      },
      {
        path: 'cmo-list',
        loadComponent: () =>
          import('./features/bm/pages/cmo-list.page').then(
            (m) => m.BmCmoListPage
          ),
      },
      {
        path: 'cmo/:cmoId',
        loadComponent: () =>
          import('./features/bm/pages/cmo-customers.page').then(
            (m) => m.BmCmoCustomersPage
          ),
      },
      {
        path: 'fraud-result/:customerId',
        loadComponent: () =>
          import('./features/bm/pages/fraud-result.page').then(
            (m) => m.FraudResultPage
          ),
      },
    ],
  },

  // ─── AUDIT Routes ────────────────────────────────────
  {
    path: 'audit',
    canActivate: [roleGuard('AUDIT')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/audit/pages/dashboard.page').then(
            (m) => m.AuditDashboardPage
          ),
      },
      {
        path: 'cmo-list',
        loadComponent: () =>
          import('./features/audit/pages/cmo-list.page').then(
            (m) => m.AuditCmoListPage
          ),
      },
      {
        path: 'cmo/:cmoId',
        loadComponent: () =>
          import('./features/audit/pages/cmo-customers.page').then(
            (m) => m.AuditCmoCustomersPage
          ),
      },
      {
        path: 'fraud-result/:customerId',
        loadComponent: () =>
          import('./features/audit/pages/fraud-result.page').then(
            (m) => m.AuditFraudResultPage
          ),
      },
    ],
  },

  // ─── Redirects ───────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
