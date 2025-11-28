import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DoctorDashboard implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  activeTab: 'patients' | 'today' = 'today'; // Default to Today

  patients: any[] = [];
  todayRdvs: any[] = [];
  // factures removed

  // For simplicity, we fetch all users to map IDs to Names in Facture View if needed
  // But RDV has patient details? Let's assume basic list for now.

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.loadPatients();
    this.loadTodayRDVs();
  }

  loadPatients() {
    this.api.getPatients().subscribe({
      next: (res) => this.patients = res,
      error: (err) => console.error('Error fetching patients', err)
    });
  }

  loadTodayRDVs() {
    this.api.getAllRendezVous().subscribe({
      next: (res) => {
        // Robust Date Comparison
        const today = new Date();
        this.todayRdvs = res.filter(r => {
          const rdvDate = new Date(r.date);
          const isToday = rdvDate.getDate() === today.getDate() &&
            rdvDate.getMonth() === today.getMonth() &&
            rdvDate.getFullYear() === today.getFullYear();

          // Show only pending appointments (status is false or null)
          return isToday && !r.status;
        });
      },
      error: (err) => console.error('Error fetching RDVs', err)
    });
  }

  markAsDone(rdv: any) {
    Swal.fire({
      title: 'Complete Appointment?',
      text: "Mark this appointment as finished?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Done',
      confirmButtonColor: '#10b981'
    }).then((res) => {
      if (res.isConfirmed) {
        // Send update to backend
        this.api.updateRendezVousStatus(rdv.id, true).subscribe({
          next: () => {
            Swal.fire('Completed!', 'Appointment marked as done.', 'success');
            this.refreshAll();
          },
          error: () => Swal.fire('Error', 'Could not update status.', 'error')
        });
      }
    });
  }

  // Helper to get Patient Name from ID
  getPatientName(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient ? patient.fullName : ('Patient #' + id);
  }

  // --- PROFILE ---
  async editProfile() {
    const user = this.auth.currentUserValue;
    if (!user) return;

    const { value: formValues } = await Swal.fire({
      title: 'Edit My Profile',
      html: `
            <input id="fullName" class="swal2-input" placeholder="Full Name" value="${user.fullName || ''}">
            <input id="email" class="swal2-input" placeholder="Email" value="${user.email || ''}">
            <input id="password" type="password" class="swal2-input" placeholder="New Password (optional)">
          `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        return {
          fullName: (document.getElementById('fullName') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value,
          password: (document.getElementById('password') as HTMLInputElement).value
        }
      }
    });

    if (formValues) {
      // Sync Auth
      this.auth.updateUser(user.email, formValues).subscribe({
        next: () => {
          Swal.fire('Success', 'Profile updated. Please login again.', 'success')
            .then(() => this.auth.logout());
        },
        error: (err) => Swal.fire('Error', 'Update failed', 'error')
      });
    }
  }

  logout() {
    this.auth.logout();
  }
}
