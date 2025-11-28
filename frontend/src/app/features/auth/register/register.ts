import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    birthDate: ['1990-01-01'],
    gender: ['M'],
    phone: ['0000000000']
  });

  errorMessage: string = '';
  isSubmitting = false;

  onSubmit() {
    if (this.registerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const userData = { ...this.registerForm.value, role: 'PATIENT' };

      this.authService.register(userData).subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Compte créé !',
            text: 'Connexion automatique en cours...',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          this.authService.login({
            email: userData.email,
            password: userData.password
          }).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.router.navigate(['/patient/dashboard']);
            },
            error: (loginErr) => {
              console.error('Auto-login failed', loginErr);
              this.isSubmitting = false;
              Swal.fire('Succès', 'Compte créé. Veuillez vous connecter manuellement.', 'success')
                .then(() => this.router.navigate(['/login']));
            }
          });
        },
        error: (err) => {
          console.error('Registration Error:', err);

          let title = 'Oops...';
          let msg = 'Registration failed. Please try again.';

          // 409 Conflict or 500 Internal Server Error (caused by unhandled RuntimeException "Email taken")
          if (err.status === 409 || err.status === 500 || (err.error && typeof err.error === 'string' && err.error.includes('exists'))) {
            title = 'Compte existant ?';
            msg = 'Cet email est probablement déjà utilisé (ou erreur serveur). Essayez de vous connecter.';
          }

          Swal.fire({
            icon: 'error',
            title: title,
            text: msg,
            confirmButtonColor: '#ef4444',
            showCancelButton: true,
            cancelButtonText: 'Se connecter',
            confirmButtonText: 'Réessayer'
          }).then((res) => {
            if (res.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/login']);
            }
          });

          this.errorMessage = msg;
          this.isSubmitting = false;
        }
      });
    }
  }
}
