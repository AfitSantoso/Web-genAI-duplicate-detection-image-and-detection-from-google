import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  readonly apiUrl = 'http://localhost:8000';
  readonly appName = 'FRIDAYS';
  readonly appVersion = '4.0';
  readonly appDescription = 'Fraud Detection & Document Intelligence System';
}
