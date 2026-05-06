import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RechargeRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RechargeService {
  private apiUrl = `${environment.apiUrl}/recharges`;

  constructor(private http: HttpClient) { }

  initiateRecharge(recharge: RechargeRequest): Observable<RechargeRequest> {
    return this.http.post<RechargeRequest>(this.apiUrl, recharge);
  }

  getUserRecharges(userId: number): Observable<RechargeRequest[]> {
    return this.http.get<RechargeRequest[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllRecharges(): Observable<RechargeRequest[]> {
    return this.http.get<RechargeRequest[]>(`${this.apiUrl}/admin/recharges`);
  }
}
