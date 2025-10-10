import { Injectable } from '@angular/core';

export interface LoginPayload {
  identification: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3099';

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${this.baseUrl}/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }
    return res.json();
  }
}