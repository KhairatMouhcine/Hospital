import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class PatientDashboard implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);
  private fb = inject(FormBuilder);

  profile: any = null;
  doctors: any[] = [];
  rdvs: any[] = [];
  factures: any[] = [];

  activeTab: 'home' | 'book' | 'rdvs' | 'factures' = 'home';

  bookingForm: FormGroup = this.fb.group({
    doctorId: ['', Validators.required],
    date: ['', Validators.required]
  });

  ngOnInit() {
    this.loadProfile();
    this.loadDoctors();
  }

  loadProfile() {
    this.api.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res;
        this.loadRDVs(); // Chain continues here
      },
      error: (err) => {
        // ... (existing error handling/creation logic - keeping it minimal for brevity)
        Swal.fire({
          title: 'Complete your Profile',
          input: 'text',
          inputLabel: 'Full Name',
          confirmButtonText: 'Save',
          preConfirm: (name) => {
            if (!name) Swal.showValidationMessage('Name is required');
            return name;
          }
        }).then((result) => {
          if (result.isConfirmed) this.createProfile(result.value);
        });
      }
    });
  }

  createProfile(fullName: string) {
    const user = this.auth.currentUserValue;
    const newPatient = {
      fullName: fullName,
      email: user?.email || '',
      gender: 'M',
      phone: '0000000000',
      birthDate: '2000-01-01'
    };

    this.api.createPatient(newPatient).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Profile created!', 'success');
        this.profile = res;
        this.loadRDVs();
      },
      error: (e) => Swal.fire('Error', 'Could not create profile.', 'error')
    });
  }

  loadDoctors() {
    this.api.getDoctors().subscribe(res => this.doctors = res);
  }

  loadRDVs() {
    this.api.getMyRendezVous().subscribe(res => {
      this.rdvs = res;
      this.loadFactures(); // Load factures only after RVDs are loaded
    });
  }

  loadFactures() {
    // Fetch all and filter by matching RDV IDs (since Facture is linked to RDV, not Patient directly)
    this.api.getAllFactures().subscribe({
      next: (res) => {
        if (this.rdvs.length > 0) {
          const myRdvIds = this.rdvs.map(r => r.id);
          // Use loose comparison (==) to handle potential string/number mismatches from API
          this.factures = res.filter(f => myRdvIds.some(rdvId => rdvId == f.rendezVousId));
        } else {
          this.factures = [];
        }
      },
      error: (err) => console.error(err)
    });
  }

  bookRDV() {
    if (!this.profile) { Swal.fire('Error', 'Profile missing', 'error'); return; }
    if (this.bookingForm.invalid) return;

    // ... (existing booking logic logic)
    const rawDate = this.bookingForm.value.date;
    const formattedDate = rawDate.length === 16 ? rawDate + ':00' : rawDate;

    const data = {
      patientId: this.profile.id,
      doctorId: this.bookingForm.value.doctorId,
      date: formattedDate
    };

    this.api.createRendezVous(data).subscribe({
      next: () => {
        Swal.fire('Success', 'Appointment confirmed!', 'success');
        this.loadRDVs();
        this.bookingForm.reset();
        this.activeTab = 'rdvs';
      },
      error: () => Swal.fire('Error', 'Booking failed', 'error')
    });
  }

  payBill(id: number) {
    Swal.fire({
      title: 'Pay Invoice?',
      text: 'Simulate secure payment...',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Pay Now ($)',
      confirmButtonColor: '#10b981'
    }).then((res) => {
      if (res.isConfirmed) {
        this.api.payFacture(id).subscribe({
          next: () => {
            Swal.fire('Paid!', 'Invoice settled.', 'success');
            this.loadFactures(); // Refresh list to show NEW status
          },
          error: () => Swal.fire('Error', 'Payment failed.', 'error')
        });
      }
    });
  }

  // --- PROFILE EDIT ---
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
      // 1. Sync Auth
      this.auth.updateUser(user.email, formValues).subscribe({
        next: () => {
          // 2. Sync Entity (Patient Profile)
          if (this.profile) {
            // We can update the patient entity too to keep names in sync
            this.api.updatePatient(this.profile.id, {
              ...this.profile,
              fullName: formValues.fullName,
              email: formValues.email
            }).subscribe();
          }

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
