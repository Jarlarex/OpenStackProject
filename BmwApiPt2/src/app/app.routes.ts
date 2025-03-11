import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ModelListComponent } from './components/model-list/model-list.component';
import { ModelFormComponent } from './components/model-form/model-form.component';
import { SubmodelFormComponent } from './components/submodel-form/submodel-form.component';
import { LoginComponent } from './components/login/login.component';
import { LikedCarsComponent } from './components/liked-cars/liked-cars.component';
import { AuthCustomService } from './services/auth-custom.service';
import { Router } from '@angular/router';

// Auth guard function for authenticated users
const authGuard: CanActivateFn = () => {
  const authService = inject(AuthCustomService);
  const router = inject(Router);
  
  // Access the signal value with ()
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to login if not authenticated
  router.navigate(['/login']);
  return false;
};

// Admin guard function
const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthCustomService);
  const router = inject(Router);
  
  // Access the signal value with ()
  if (authService.isAdmin()) {
    return true;
  }
  
  // Redirect to models list if not admin
  router.navigate(['/models']);
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: '/models', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'models', component: ModelListComponent },
  { path: 'liked-cars', component: LikedCarsComponent, canActivate: [authGuard] },
  { path: 'models/new', component: ModelFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'models/:id/edit', component: ModelFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'models/:id/submodels/new', component: SubmodelFormComponent, canActivate: [authGuard, adminGuard] },
  { path: 'models/:id/submodels/:submodelId/edit', component: SubmodelFormComponent, canActivate: [authGuard, adminGuard] },
];
