import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiBase = '/api'; // Proxied to localhost:8080/api

    // --- PATIENTS ---
    getPatients(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/patients`);
    }

    createPatient(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiBase}/patients`, data);
    }

    updatePatient(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/patients/${id}`, data);
    }

    deletePatient(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/patients/${id}`);
    }

    getMyProfile(): Observable<any> {
        return this.http.get<any>(`${this.apiBase}/patients/me`);
    }

    // --- DOCTORS ---
    getDoctors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/doctors`);
    }

    createDoctor(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiBase}/doctors`, data);
    }

    updateDoctor(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/doctors/${id}`, data);
    }

    deleteDoctor(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/doctors/${id}`);
    }

    // --- RENDEZ-VOUS ---
    getAllRendezVous(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/rendezvous`);
    }

    getMyRendezVous(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/rendezvous/me`);
    }

    createRendezVous(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiBase}/rendezvous`, data);
    }

    // Update RDV (e.g., reschedule)
    updateRendezVous(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/rendezvous/${id}`, data);
    }

    updateRendezVousStatus(id: number, status: boolean): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/rendezvous/${id}/status?status=${status}`, {});
    }

    deleteRendezVous(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/rendezvous/${id}`);
    }

    // --- FACTURES ---
    getAllFactures(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/factures`);
    }

    createFacture(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiBase}/factures`, data);
    }

    updateFacture(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/factures/${id}`, data);
    }

    deleteFacture(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/factures/${id}`);
    }

    payFacture(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiBase}/factures/${id}/payer`, {});
    }
}
