import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard implements OnInit {
  private api = inject(ApiService);
  public auth = inject(AuthService);

  patients: any[] = [];
  doctors: any[] = [];
  rdvs: any[] = [];
  factures: any[] = [];

  activeTab: 'patients' | 'doctors' | 'rdv' | 'factures' = 'patients';

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll() {
    this.loadPatients();
    this.loadDoctors();
    this.loadRDVs();
    this.loadFactures();
  }

  loadPatients() { this.api.getPatients().subscribe(res => this.patients = res); }
  loadDoctors() { this.api.getDoctors().subscribe(res => this.doctors = res); }
  loadRDVs() { this.api.getAllRendezVous().subscribe(res => this.rdvs = res); }
  loadFactures() { this.api.getAllFactures().subscribe(res => this.factures = res); }

  // --- GENERIC EDIT FORM ---
  async openForm(type: 'patient' | 'doctor' | 'rdv' | 'facture', item?: any) {
    let title = item ? `Edit ${type}` : `Create ${type}`;
    let html = '';
    let preConfirm: any;

    if (type === 'patient') {
      html = `
            <input id="fullName" class="swal2-input" placeholder="Full Name" value="${item?.fullName || ''}">
            <input id="email" class="swal2-input" placeholder="Email" value="${item?.email || ''}">
            <input id="password" type="password" class="swal2-input" placeholder="${item ? 'New Password (optional)' : 'Password (required)'}">
        `;
      preConfirm = () => {
        const data: any = {
          fullName: (document.getElementById('fullName') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value
        };
        data.password = (document.getElementById('password') as HTMLInputElement).value;

        if (!item && !data.password) Swal.showValidationMessage('Password is required');

        return data;
      };
    } else if (type === 'doctor') {
      html = `
            <input id="fullName" class="swal2-input" placeholder="Full Name" value="${item?.fullName || ''}">
            <input id="specialty" class="swal2-input" placeholder="Specialty" value="${item?.specialty || ''}">
            <input id="email" class="swal2-input" placeholder="Email" value="${item?.email || ''}">
             <input id="password" type="password" class="swal2-input" placeholder="${item ? 'New Password (optional)' : 'Password (required)'}">
        `;
      preConfirm = () => {
        const data: any = {
          fullName: (document.getElementById('fullName') as HTMLInputElement).value,
          specialty: (document.getElementById('specialty') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value
        };
        data.password = (document.getElementById('password') as HTMLInputElement).value;

        if (!item && !data.password) Swal.showValidationMessage('Password is required');

        return data;
      };
    } else if (type === 'rdv') {
      // Build Patient and Doctor options
      const patientOptions: { [key: string]: string } = {};
      const doctorOptions: { [key: string]: string } = {};

      this.patients.forEach(p => patientOptions[p.id] = `${p.fullName} (${p.email})`);
      this.doctors.forEach(d => doctorOptions[d.id] = `${d.fullName} - ${d.specialty}`);

      html = `
        <select id="patientId" class="swal2-input" style="display: block; width: 80%; margin: 10px auto;">
          <option value="">Select Patient</option>
          ${Object.keys(patientOptions).map(id => `<option value="${id}">${patientOptions[id]}</option>`).join('')}
        </select>
        <select id="doctorId" class="swal2-input" style="display: block; width: 80%; margin: 10px auto;">
          <option value="">Select Doctor</option>
          ${Object.keys(doctorOptions).map(id => `<option value="${id}">${doctorOptions[id]}</option>`).join('')}
        </select>
        <input id="rdvDate" type="datetime-local" class="swal2-input" placeholder="Date & Time">
      `;

      preConfirm = () => {
        const patientId = (document.getElementById('patientId') as HTMLSelectElement).value;
        const doctorId = (document.getElementById('doctorId') as HTMLSelectElement).value;
        const date = (document.getElementById('rdvDate') as HTMLInputElement).value;

        if (!patientId || !doctorId || !date) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }

        // Format date to include seconds for backend
        const formattedDate = date.length === 16 ? date + ':00' : date;

        return {
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          date: formattedDate
        };
      };
    } else if (type === 'facture') {
      if (item) {
        // --- EDIT MODE ---
        // Allow updating status or amount if needed. Usually just status update (mark as Paid).
        html = `
            <div style="margin-bottom:10px; font-weight:bold;">Editing Facture #${item.id}</div>
            <label>Status</label>
            <select id="status" class="swal2-input" style="display: block; width: 80%; margin: 10px auto;">
                <option value="EN_ATTENTE" ${item.status === 'EN_ATTENTE' ? 'selected' : ''}>En Attente</option>
                <option value="PAYEE" ${item.status === 'PAYEE' ? 'selected' : ''}>Payée</option>
            </select>
            <label>Amount (DH)</label>
            <input id="montant" type="number" class="swal2-input" value="${item.montant || 0}">
        `;
        preConfirm = () => {
          return {
            status: (document.getElementById('status') as HTMLSelectElement).value,
            montant: parseFloat((document.getElementById('montant') as HTMLInputElement).value)
          };
        };
      } else {
        // --- CREATE MODE ---
        // Build RDV options (only show RDVs that don't have a facture yet? For now show all)
        const rdvOptions: { [key: string]: string } = {};
        this.rdvs.forEach(r => rdvOptions[r.id] = `RDV #${r.id} - ${new Date(r.date).toLocaleString()}`);

        html = `
              <select id="rendezVousId" class="swal2-input" style="display: block; width: 80%; margin: 10px auto;">
                  <option value="">Select Rendez-Vous</option>
                  ${Object.keys(rdvOptions).map(id => `<option value="${id}">${rdvOptions[id]}</option>`).join('')}
              </select>
              <select id="typeConsultation" class="swal2-input" style="display: block; width: 80%; margin: 10px auto;">
                  <option value="GENERAL">General (200 DH)</option>
                  <option value="SPECIALISTE">Specialiste (300 DH)</option>
                  <option value="URGENCE">Urgence (500 DH)</option>
              </select>
              <div style="margin-top: 15px;">
                  <input type="checkbox" id="assurance">
                  <label for="assurance">Has Insurance? (30% off)</label>
              </div>
          `;
        preConfirm = () => {
          const rdvId = (document.getElementById('rendezVousId') as HTMLSelectElement).value;
          const type = (document.getElementById('typeConsultation') as HTMLSelectElement).value;
          const assurance = (document.getElementById('assurance') as HTMLInputElement).checked;

          if (!rdvId) {
            Swal.showValidationMessage('Rendez-Vous is required');
            return false;
          }

          return {
            rendezVousId: parseInt(rdvId),
            typeConsultation: type,
            assurance: assurance
          };
        };
      }
    }

    if (html) {
      const { value: formValues } = await Swal.fire({
        title,
        html,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: '#0f766e',
        preConfirm
      });

      if (formValues) {
        if (item) {
          // Update
          let obs;
          if (type === 'patient' || type === 'doctor') {
            // 1. Update Auth User (Email/Password/Name)
            // We use item.email as the "currentEmail" identifier
            this.auth.updateUser(item.email, formValues).subscribe({
              next: () => {
                // 2. Update Profile Entity
                let entityObs;
                if (type === 'patient') entityObs = this.api.updatePatient(item.id, formValues);
                else entityObs = this.api.updateDoctor(item.id, formValues);

                entityObs.subscribe({
                  next: () => {
                    Swal.fire('Saved!', 'Profile & Credentials updated.', 'success');
                    this.refreshAll();
                  },
                  error: () => Swal.fire('Warning', 'Credentials updated, but Profile update failed.', 'warning')
                });
              },
              error: (err) => Swal.fire('Error', 'Update failed: ' + (err.error || 'Check email uniqueness'), 'error')
            });

          } else {
            // Facture update
            if (type === 'facture') {
              this.api.updateFacture(item.id, formValues).subscribe({
                next: () => { Swal.fire('Saved!', '', 'success'); this.refreshAll(); },
                error: () => Swal.fire('Error', 'Update failed', 'error')
              });
            }
          }
        } else {
          // Create Logic
          if (type === 'patient' || type === 'doctor') {
            // Use provided password or fallback
            formValues.role = type === 'patient' ? 'PATIENT' : 'DOCTOR';
            if (!formValues.password) formValues.password = '123456';

            // 1. Create Login Account
            this.auth.register(formValues).subscribe({
              next: () => {
                // 2. Create Entity Profile
                // Add standard defaults for missing fields to pass validation if needed
                const entityData = {
                  ...formValues,
                  phone: '0000000000',
                  birthDate: '2000-01-01',
                  gender: 'M'
                };

                let entityObs;
                if (type === 'patient') entityObs = this.api.createPatient(entityData);
                else entityObs = this.api.createDoctor(entityData);

                entityObs.subscribe({
                  next: () => {
                    Swal.fire('Created!', 'User account & Profile created successfully.', 'success');
                    this.refreshAll();
                  },
                  error: (err) => {
                    // Profile creation failed but Auth succeeded -> Rollback
                    console.error('Profile creation error', err);

                    // Attempt to delete the Auth user we just created
                    this.auth.deleteUser(formValues.email).subscribe({
                      next: () => Swal.fire('Error', `Profile creation failed: ${err.error?.message || JSON.stringify(err.error) || err.statusText}. Account rolled back.`, 'error'),
                      error: () => Swal.fire('Critical Error', 'Profile failed AND Rollback failed. Orphaned account exists.', 'error')
                    });

                    this.refreshAll();
                  }
                });
              },
              error: (err) => Swal.fire('Error', 'Account creation failed: ' + (err.error || 'Server Error'), 'error')
            });

          } else if (type === 'rdv') {
            // RDV creation
            this.api.createRendezVous(formValues).subscribe({
              next: () => {
                Swal.fire('Created!', 'Rendez-vous created successfully.', 'success');
                this.refreshAll();
              },
              error: (err) => Swal.fire('Error', 'RDV creation failed', 'error')
            });
          } else {
            // Facture creation (unchanged)
            if (type === 'facture') {
              this.api.createFacture(formValues).subscribe({
                next: () => {
                  Swal.fire('Created!', 'Facture created.', 'success');
                  this.refreshAll();
                },
                error: (err) => Swal.fire('Error', 'Facture creation failed', 'error')
              });
            }
          }
        }
      }
    }
  }


  // --- DELETE ACTIONS ---
  deletePatient(id: number) { this.deleteItem('patient', id); }
  deleteDoctor(id: number) { this.deleteItem('doctor', id); }
  deleteRendezVous(id: number) { this.deleteItem('rdv', id); }
  deleteFacture(id: number) { this.deleteItem('facture', id); }

  // --- DELETE ACTIONS ---
  deleteItem(type: 'patient' | 'doctor' | 'rdv' | 'facture', id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {

        // Helper to run entity deletion
        const runEntityDelete = () => {
          let obs;
          if (type === 'patient') obs = this.api.deletePatient(id);
          else if (type === 'doctor') obs = this.api.deleteDoctor(id);
          else if (type === 'rdv') obs = this.api.deleteRendezVous(id);
          else if (type === 'facture') obs = this.api.deleteFacture(id);

          obs?.subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Item has been deleted.', 'success');
              this.refreshAll();
            },
            error: () => Swal.fire('Error', 'Could not delete entity item.', 'error')
          });
        };

        if (type === 'patient' || type === 'doctor') {
          // We need to delete the Login Account first.
          // Find the item to get its email
          const item = (type === 'patient' ? this.patients : this.doctors).find(i => i.id === id);

          if (item && item.email) {
            this.auth.deleteUser(item.email).subscribe({
              next: () => runEntityDelete(),
              error: (err) => {
                console.error(err);
                // If auth delete fails (e.g. user not found), ask if force delete entity?
                Swal.fire({
                  title: 'Auth Delete Failed',
                  text: 'Login account could not be found/deleted. Delete profile anyway?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Force Delete Profile'
                }).then(res => {
                  if (res.isConfirmed) runEntityDelete();
                });
              }
            });
          } else {
            // No email found, just delete entity
            runEntityDelete();
          }
        } else {
          // RDV / Facture -> Direct delete
          runEntityDelete();
        }
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
