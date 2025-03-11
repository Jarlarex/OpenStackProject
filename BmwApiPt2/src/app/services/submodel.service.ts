import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { AuthCustomService } from './auth-custom.service';
import { Submodel } from './model.service';

interface LikedSubmodelsResponse {
  likedSubmodels: Array<{
    modelId: string;
    modelName: string;
    submodelId: string;
    submodel: Submodel;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SubmodelService {
  private baseUrl = 'http://localhost:3000/api/v1/models';
  
  // Using Angular Signals for state management
  private submodelsSignal = signal<Map<string, Submodel[]>>(new Map());
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Expose read-only signals
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

  // Get submodels for a specific model
  getSubmodelsForModel(modelId: string): Submodel[] {
    return this.submodelsSignal().get(modelId) || [];
  }

  // Load submodels for a specific model
  loadSubmodelsByModelId(modelId: string): Observable<Submodel[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    return this.http.get<Submodel[]>(`${this.baseUrl}/${modelId}/submodels`).pipe(
      tap(submodels => {
        const currentMap = this.submodelsSignal();
        const newMap = new Map(currentMap);
        newMap.set(modelId, submodels);
        this.submodelsSignal.set(newMap);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set('Failed to load submodels. Please try again later.');
        this.loadingSignal.set(false);
        return throwError(() => new Error(error.error?.message || 'Failed to load submodels'));
      })
    );
  }

  getSubmodelById(modelId: string, submodelId: string): Observable<Submodel> {
    return this.http.get<Submodel>(`${this.baseUrl}/${modelId}/submodels/${submodelId}`);
  }  

  addSubmodel(modelId: string, submodel: Partial<Submodel>): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<{message: string, submodel: Submodel}>(`${this.baseUrl}/${modelId}/submodels`, submodel, { headers }).pipe(
      tap(response => {
        // Update the local state
        const currentMap = this.submodelsSignal();
        const modelSubmodels = currentMap.get(modelId) || [];
        const newMap = new Map(currentMap);
        newMap.set(modelId, [...modelSubmodels, response.submodel]);
        this.submodelsSignal.set(newMap);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to add submodel'));
      })
    );
  }

  updateSubmodel(modelId: string, submodelId: string, submodel: Partial<Submodel>): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/${modelId}/submodels/${submodelId}`, submodel, { headers }).pipe(
      tap(() => {
        // Update the local state
        const currentMap = this.submodelsSignal();
        const modelSubmodels = currentMap.get(modelId) || [];
        const updatedSubmodels = modelSubmodels.map(s => 
          s._id === submodelId ? { ...s, ...submodel, _id: submodelId } : s
        );
        
        const newMap = new Map(currentMap);
        newMap.set(modelId, updatedSubmodels);
        this.submodelsSignal.set(newMap);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to update submodel'));
      })
    );
  }

  deleteSubmodel(modelId: string, submodelId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/${modelId}/submodels/${submodelId}`, { headers }).pipe(
      tap(() => {
        // Update the local state
        const currentMap = this.submodelsSignal();
        const modelSubmodels = currentMap.get(modelId) || [];
        const filteredSubmodels = modelSubmodels.filter(s => s._id !== submodelId);
        
        const newMap = new Map(currentMap);
        newMap.set(modelId, filteredSubmodels);
        this.submodelsSignal.set(newMap);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to delete submodel'));
      })
    );
  }

  // Like a submodel
  likeSubmodel(modelId: string, submodelId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to like a submodel'));
    }

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    const headers = this.getHeaders();
    return this.http.post<any>(
      `http://localhost:3000/api/v1/users/${userId}/like`, 
      { modelId, submodelId }, 
      { headers }
    ).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to like submodel'));
      })
    );
  }

  // Unlike a submodel
  unlikeSubmodel(modelId: string, submodelId: string): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be authenticated to unlike a submodel'));
    }

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    const headers = this.getHeaders();
    return this.http.post<any>(
      `http://localhost:3000/api/v1/users/${userId}/unlike`, 
      { modelId, submodelId }, 
      { headers }
    ).pipe(
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Failed to unlike submodel'));
      })
    );
  }

  // Get all liked submodels for the current user
  getLikedSubmodels(): Observable<LikedSubmodelsResponse> {
    if (!this.authService.isAuthenticated()) {
      return of({ likedSubmodels: [] });
    }

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      return of({ likedSubmodels: [] });
    }

    const headers = this.getHeaders();
    return this.http.get<LikedSubmodelsResponse>(`http://localhost:3000/api/v1/users/${userId}/liked`, { headers }).pipe(
      tap(response => {
        // You could store the liked submodels in a signal here if needed
      }),
      catchError(error => {
        return of({ likedSubmodels: [] });
      })
    );
  }

  // Check if a submodel is liked by the current user
  isSubmodelLiked(modelId: string, submodelId: string): Observable<boolean> {
    return this.getLikedSubmodels().pipe(
      map(response => {
        return response.likedSubmodels.some(
          (item: {modelId: string, submodelId: string}) => 
            item.modelId === modelId && item.submodelId === submodelId
        );
      }),
      catchError(() => of(false))
    );
  }
}
