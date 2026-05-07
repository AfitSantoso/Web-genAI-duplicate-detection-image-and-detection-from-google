import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuditFacade } from '../../../core/facades/audit.facade';

@Component({
  selector: 'app-audit-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class AuditDashboardPage implements OnInit {
  readonly facade = inject(AuditFacade);
  ngOnInit(): void { this.facade.loadDashboard(); }
}
