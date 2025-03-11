import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { AuthCustomService } from './auth-custom.service';

export interface Submodel {
  _id?: string;
  name: string;
  engineType: string;
  horsepower: number;
  torque: number;
  transmission: string;
  year: number;
  imageURL?: string;
  weight?: number;
  acceleration?: number;
  topSpeed?: number;
  fuelEconomy?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;
  };
}

export interface Model {
  _id?: string;
  name: string;
  yearIntroduced: number;
  yearDiscontinued: number;
  description: string;
  submodels: Submodel[];
  country?: string;
  designer?: string;
  bodyStyle?: string;
  platform?: string;
  predecessor?: string;
  successor?: string;
  imageURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isExpanded?: boolean; // UI state
}

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private baseUrl = 'http://localhost:3000/api/v1/models';
  
  // Using Angular Signals for state management
  private modelsSignal = signal<Model[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Computed signals
  readonly models = this.modelsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient, private authService: AuthCustomService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  loadAllModels(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.http.get<Model[]>(`${this.baseUrl}`).pipe(
      tap(models => {
        this.modelsSignal.set(models);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set('Failed to load models. Please try again later.');
        this.loadingSignal.set(false);
        return of([]);
      })
    ).subscribe();
  }

  getModelById(id: string): Observable<Model> {
    return this.http.get<Model>(`${this.baseUrl}/${id}`);
  }

  createModel(modelData: Partial<Model>): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}`, modelData, { headers }).pipe(
      tap(() => this.loadAllModels()),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to create model'));
      })
    );
  }

  updateModel(id: string, modelData: Partial<Model>): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.baseUrl}/${id}`, modelData, { headers }).pipe(
      tap(() => {
        // Update the model in the local state
        const models = this.modelsSignal();
        const index = models.findIndex(m => m._id === id);
        if (index !== -1) {
          const updatedModels = [...models];
          updatedModels[index] = { ...updatedModels[index], ...modelData };
          this.modelsSignal.set(updatedModels);
        }
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to update model'));
      })
    );
  }

  deleteModel(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.baseUrl}/${id}`, { headers }).pipe(
      tap(() => {
        // Remove the model from the local state
        const models = this.modelsSignal();
        this.modelsSignal.set(models.filter(m => m._id !== id));
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to delete model'));
      })
    );
  }
}
