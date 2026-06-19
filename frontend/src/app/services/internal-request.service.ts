import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  InternalRequestCreate,
  InternalRequestResponse,
  RequestHistoryResponse,
  RequestStatusAction,
} from '../models/internal-request';

@Injectable({
  providedIn: 'root',
})
export class InternalRequestService {
  private readonly apiUrl = `${environment.apiUrl}/requests`;

  constructor(private readonly http: HttpClient) {}

  createRequest(data: InternalRequestCreate): Observable<InternalRequestResponse> {
    return this.http.post<InternalRequestResponse>(this.apiUrl, data);
  }

  getMyRequests(): Observable<InternalRequestResponse[]> {
    return this.http.get<InternalRequestResponse[]>(`${this.apiUrl}/my`);
  }

  getAllRequests(): Observable<InternalRequestResponse[]> {
    return this.http.get<InternalRequestResponse[]>(this.apiUrl);
  }

  getRequestById(id: number): Observable<InternalRequestResponse> {
    return this.http.get<InternalRequestResponse>(`${this.apiUrl}/${id}`);
  }

  getRequestHistory(id: number): Observable<RequestHistoryResponse[]> {
    return this.http.get<RequestHistoryResponse[]>(`${this.apiUrl}/${id}/history`);
  }

  startAnalysis(
    id: number,
    data: RequestStatusAction,
  ): Observable<InternalRequestResponse> {
    return this.http.patch<InternalRequestResponse>(
      `${this.apiUrl}/${id}/start-analysis`,
      data,
    );
  }

  approveRequest(
    id: number,
    data: RequestStatusAction,
  ): Observable<InternalRequestResponse> {
    return this.http.patch<InternalRequestResponse>(
      `${this.apiUrl}/${id}/approve`,
      data,
    );
  }

  rejectRequest(
    id: number,
    data: RequestStatusAction,
  ): Observable<InternalRequestResponse> {
    return this.http.patch<InternalRequestResponse>(
      `${this.apiUrl}/${id}/reject`,
      data,
    );
  }

  concludeRequest(
    id: number,
    data: RequestStatusAction,
  ): Observable<InternalRequestResponse> {
    return this.http.patch<InternalRequestResponse>(
      `${this.apiUrl}/${id}/conclude`,
      data,
    );
  }

  cancelRequest(
    id: number,
    data: RequestStatusAction,
  ): Observable<InternalRequestResponse> {
    return this.http.patch<InternalRequestResponse>(
      `${this.apiUrl}/${id}/cancel`,
      data,
    );
  }
}