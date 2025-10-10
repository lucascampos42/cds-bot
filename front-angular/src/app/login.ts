import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    identification: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  async onSubmit() {
    this.error.set(null);
    this.success.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      const { identification, password } = this.form.value;
      const result = await this.auth.login({
        identification: identification as string,
        password: password as string,
      });
      // Persist tokens de forma simples
      localStorage.setItem('accessToken', result?.accessToken ?? '');
      localStorage.setItem('refreshToken', result?.refreshToken ?? '');
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Falha no login');
    } finally {
      this.loading.set(false);
    }
  }
}