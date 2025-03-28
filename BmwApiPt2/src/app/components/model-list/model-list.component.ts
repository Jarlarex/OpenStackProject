import { Component, OnInit, computed, effect, signal, OnDestroy, inject, Injector, runInInjectionContext } from '@angular/core';
import { ModelService, Model, Submodel } from '../../services/model.service';
import { SubmodelService } from '../../services/submodel.service';
import { AuthCustomService } from '../../services/auth-custom.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-model-list',
  standalone: true,
  imports: [
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule, 
    CommonModule, 
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.css'],
})
export class ModelListComponent implements OnInit, OnDestroy {
  // Track liked submodels
  private likedSubmodelsMap = signal<Map<string, boolean>>(new Map());
  private likedSubmodelsSubscription?: Subscription;
  displayedColumns = signal<string[]>(['name', 'yearIntroduced', 'yearDiscontinued', 'description', 'actions']);
  
  // Use the signals from the services
  models = this.modelService.models;
  loading = this.modelService.loading;
  error = this.modelService.error;
  
  // Auth signals
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  private injector = inject(Injector);

  constructor(
    public modelService: ModelService,
    private submodelService: SubmodelService,
    public authService: AuthCustomService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Set up column effect in constructor
    this.setupColumnEffect();
  }

  private setupColumnEffect(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const columns = ['name', 'yearIntroduced', 'yearDiscontinued', 'description'];
        
        // Add actions column if user is authenticated
        if (this.authService.isAuthenticated()) {
          columns.push('actions');
        }
        
        this.displayedColumns.set(columns);
      }, { allowSignalWrites: true });
    });
  }

  ngOnInit(): void {
    // Load models when component initializes
    this.modelService.loadAllModels();
    
    // Load liked submodels if authenticated
    if (this.authService.isAuthenticated()) {
      this.loadLikedSubmodels();
    }
    
    // Set up effect to reload liked submodels when auth state changes
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.authService.isAuthenticated()) {
          this.loadLikedSubmodels();
        } else {
          this.likedSubmodelsMap.set(new Map());
        }
      }, { allowSignalWrites: true });
    });
  }

  toggleSubmodels(model: Model): void {
    if (model.isExpanded) {
      model.isExpanded = false;
    } else if (!model.submodels || model.submodels.length === 0) {
      this.submodelService.loadSubmodelsByModelId(model._id!).subscribe({
        next: (submodels) => {
          // The submodels are now loaded in the service
          model.isExpanded = true;
          // Scroll to the submodels section after a short delay to allow for rendering
          setTimeout(() => {
            this.scrollToSubmodels(model._id!);
          }, 100);
        },
        error: (err) => {
          this.snackBar.open('Failed to load submodels', 'Close', { duration: 3000 });
        }
      });
    } else {
      model.isExpanded = true;
      // Scroll to the submodels section
      setTimeout(() => {
        this.scrollToSubmodels(model._id!);
      }, 100);
    }
  }

  // Helper method to scroll to the submodels section
  private scrollToSubmodels(modelId: string): void {
    const element = document.getElementById(`submodels-${modelId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteModel(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Model',
        message: 'Are you sure you want to delete this model? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.modelService.deleteModel(id).subscribe({
          next: () => {
            this.snackBar.open('Model deleted successfully', 'Close', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            this.snackBar.open('Failed to delete model', 'Close', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteSubmodel(modelId: string, submodelId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Submodel',
        message: 'Are you sure you want to delete this submodel? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submodelService.deleteSubmodel(modelId, submodelId).subscribe({
          next: () => {
            this.snackBar.open('Submodel deleted successfully', 'Close', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            this.snackBar.open('Failed to delete submodel', 'Close', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Load liked submodels for the current user
  private loadLikedSubmodels(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.likedSubmodelsSubscription = this.submodelService.getLikedSubmodels().subscribe({
      next: (response) => {
        const newMap = new Map<string, boolean>();
        response.likedSubmodels.forEach(item => {
          const key = `${item.modelId}:${item.submodelId}`;
          newMap.set(key, true);
        });
        this.likedSubmodelsMap.set(newMap);
      },
      error: (err) => {
        this.snackBar.open('Failed to load liked cars', 'Close', { duration: 3000 });
      }
    });
  }

  // Check if a submodel is liked by the current user
  isSubmodelLiked(modelId: string, submodelId: string): boolean {
    const key = `${modelId}:${submodelId}`;
    return this.likedSubmodelsMap().has(key);
  }

  // Toggle like/unlike for a submodel
  toggleLikeSubmodel(modelId: string, submodelId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const isLiked = this.isSubmodelLiked(modelId, submodelId);
    
    if (isLiked) {
      // Unlike the submodel
      this.submodelService.unlikeSubmodel(modelId, submodelId).subscribe({
        next: () => {
          // Update local state
          const key = `${modelId}:${submodelId}`;
          const currentMap = this.likedSubmodelsMap();
          const newMap = new Map(currentMap);
          newMap.delete(key);
          this.likedSubmodelsMap.set(newMap);
          
          this.snackBar.open('Removed from your liked cars', 'Close', { duration: 2000 });
        },
        error: (err) => {
          this.snackBar.open('Failed to unlike car', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Like the submodel
      this.submodelService.likeSubmodel(modelId, submodelId).subscribe({
        next: () => {
          // Update local state
          const key = `${modelId}:${submodelId}`;
          const currentMap = this.likedSubmodelsMap();
          const newMap = new Map(currentMap);
          newMap.set(key, true);
          this.likedSubmodelsMap.set(newMap);
          
          this.snackBar.open('Added to your liked cars', 'Close', { duration: 2000 });
        },
        error: (err) => {
          this.snackBar.open('Failed to like car', 'Close', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.likedSubmodelsSubscription) {
      this.likedSubmodelsSubscription.unsubscribe();
    }
  }
}
