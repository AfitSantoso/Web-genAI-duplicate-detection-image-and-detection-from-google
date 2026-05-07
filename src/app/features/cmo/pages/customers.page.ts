import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CmoFacade } from '../../../core/facades/cmo.facade';

@Component({
  selector: 'app-cmo-customers',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './customers.page.html',
  styleUrl: './customers.page.scss',
})
export class CmoCustomersPage implements OnInit {
  readonly facade = inject(CmoFacade);
  readonly showCreateModal = signal(false);
  newCustomerName = '';

  ngOnInit(): void {
    this.facade.loadCustomers();
  }

  onCreate(): void {
    if (this.newCustomerName.trim()) {
      this.facade.createCustomer(this.newCustomerName.trim());
      this.newCustomerName = '';
      this.showCreateModal.set(false);
    }
  }
}
