import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentTransaction } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  makePayment(payment: PaymentTransaction): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-order`, payment);
  }

  verifyPayment(callbackData: any): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.apiUrl}/verify`, callbackData);
  }
}
