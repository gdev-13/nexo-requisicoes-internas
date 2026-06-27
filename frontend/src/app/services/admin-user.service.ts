import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AdminUserResponse, UserRoleUpdate } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<AdminUserResponse[]> {
    return this.http.get<AdminUserResponse[]>(this.apiUrl);
  }

  updateUserRole(
    id: number,
    data: UserRoleUpdate,
  ): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.apiUrl}/${id}/role`, data);
  }
}