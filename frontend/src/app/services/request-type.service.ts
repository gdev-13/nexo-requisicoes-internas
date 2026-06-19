import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  RequestTypeCreate,
  RequestTypeResponse,
  RequestTypeUpdate,
} from '../models/request-type';

@Injectable({
  providedIn: 'root',
})
export class RequestTypeService {
  private readonly apiUrl = `${environment.apiUrl}/request-types`;

  constructor(private readonly http: HttpClient) {}

  getActiveRequestTypes(): Observable<RequestTypeResponse[]> {
    return this.http.get<RequestTypeResponse[]>(this.apiUrl);
  }

  getAllRequestTypes(): Observable<RequestTypeResponse[]> {
    return this.http.get<RequestTypeResponse[]>(`${this.apiUrl}/all`);
  }

  createRequestType(data: RequestTypeCreate): Observable<RequestTypeResponse> {
    return this.http.post<RequestTypeResponse>(this.apiUrl, data);
  }

  updateRequestType(
    id: number,
    data: RequestTypeUpdate,
  ): Observable<RequestTypeResponse> {
    return this.http.put<RequestTypeResponse>(`${this.apiUrl}/${id}`, data);
  }

  disableRequestType(id: number): Observable<RequestTypeResponse> {
    return this.http.patch<RequestTypeResponse>(`${this.apiUrl}/${id}/disable`, {});
  }

  enableRequestType(id: number): Observable<RequestTypeResponse> {
    return this.http.patch<RequestTypeResponse>(`${this.apiUrl}/${id}/enable`, {});
  }
}