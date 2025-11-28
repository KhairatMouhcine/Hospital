import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AdminDashboard } from './features/admin/dashboard/dashboard';
import { DoctorDashboard } from './features/doctor/dashboard/dashboard';
import { PatientDashboard } from './features/patient/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', redirectTo: '/login' },

    {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [authGuard, roleGuard],
        data: { role: 'ADMIN' }
    },
    {
        path: 'doctor',
        component: DoctorDashboard,
        canActivate: [authGuard, roleGuard],
        data: { role: 'DOCTOR' }
    },
    {
        path: 'patient',
        component: PatientDashboard,
        canActivate: [authGuard, roleGuard],
        data: { role: 'PATIENT' }
    },

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
