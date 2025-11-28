import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage: string = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          const role = this.authService.getRole();
          this.redirectBasedOnRole(role);
        },
        error: (err) => {
          this.errorMessage = 'Invalid credentials or server error.';
          console.error(err);
        }
      });
    }
  }

  private redirectBasedOnRole(role: string | null) {
    if (!role) {
      this.router.navigate(['/']);
      return;
    }
    switch (role.toUpperCase()) {
      case 'ADMIN': this.router.navigate(['/admin']); break;
      case 'DOCTOR': this.router.navigate(['/doctor']); break;
      case 'PATIENT': this.router.navigate(['/patient']); break;
      default: this.router.navigate(['/login']);
    }
  }
}
