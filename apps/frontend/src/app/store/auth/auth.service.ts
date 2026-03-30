import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAuthResponse, ILoginRequest, ISignupRequest, IUser } from '@app/interfaces';
import { environment } from '../../../envs/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/login`, request, {
      withCredentials: true,
    });
  }

  signup(request: ISignupRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.baseUrl}/signup`, request, {
      withCredentials: true,
    });
  }

  refreshToken(): Observable<{ accessToken: string; xsrfToken: string }> {
    return this.http.post<{ accessToken: string; xsrfToken: string }>(
      `${this.baseUrl}/refresh-token`,
      {},
      { withCredentials: true },
    );
  }

  logout(): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/logout`, {
      withCredentials: true,
    });
  }

  getMe(): Observable<IUser> {
    return this.http.get<IUser>(`${this.baseUrl}/me`);
  }
}
