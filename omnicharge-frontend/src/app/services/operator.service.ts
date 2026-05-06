import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TelecomOperator, RechargePlan } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private apiUrl = `${environment.apiUrl}/operators`;

  constructor(private http: HttpClient) { }

  getOperators(): Observable<TelecomOperator[]> {
    return this.http.get<TelecomOperator[]>(this.apiUrl);
  }

  getPlansByOperator(operatorId: number): Observable<RechargePlan[]> {
    return this.http.get<RechargePlan[]>(`${this.apiUrl}/${operatorId}/plans`);
  }

  createOperator(operator: Partial<TelecomOperator>): Observable<TelecomOperator> {
    return this.http.post<TelecomOperator>(this.apiUrl, operator);
  }

  deleteOperator(operatorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${operatorId}`);
  }

  createPlan(operatorId: number, plan: Partial<RechargePlan>): Observable<RechargePlan> {
    return this.http.post<RechargePlan>(`${this.apiUrl}/${operatorId}/plans`, plan);
  }

  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${planId}`);
  }
}
