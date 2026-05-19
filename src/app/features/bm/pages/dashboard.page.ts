import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BmFacade } from '../../../core/facades/bm.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';

@Component({
  selector: 'app-bm-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class BmDashboardPage implements OnInit {
  readonly facade = inject(BmFacade);
  readonly auth = inject(AuthFacade);

  ngOnInit(): void {
    this.facade.loadDashboard();
    this.facade.loadFlaggedCustomers();
  }
}
