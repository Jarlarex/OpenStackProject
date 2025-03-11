import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { SubmodelService } from '../../services/submodel.service';
import { AuthCustomService } from '../../services/auth-custom.service';
import { Submodel } from '../../services/model.service';

interface LikedSubmodelDetails {
  modelId: string;
  modelName: string;
  submodelId: string;
  submodel: Submodel;
}

@Component({
  selector: 'app-liked-cars',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './liked-cars.component.html',
  styleUrl: './liked-cars.component.css'
})
export class LikedCarsComponent implements OnInit {
  likedSubmodels = signal<LikedSubmodelDetails[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private submodelService: SubmodelService,
    public authService: AuthCustomService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLikedSubmodels();
  }

  loadLikedSubmodels(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.submodelService.getLikedSubmodels().subscribe({
      next: (response) => {
        this.likedSubmodels.set(response.likedSubmodels);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading liked submodels:', err);
        this.error.set('Failed to load your liked cars. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  unlikeSubmodel(modelId: string, submodelId: string): void {
    this.submodelService.unlikeSubmodel(modelId, submodelId).subscribe({
      next: () => {
        // Remove the unliked submodel from the list
        const currentLiked = this.likedSubmodels();
        this.likedSubmodels.set(
          currentLiked.filter(item => 
            !(item.modelId === modelId && item.submodelId === submodelId)
          )
        );
        this.snackBar.open('Car removed from your liked cars', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error unliking submodel:', err);
        this.snackBar.open('Failed to remove car from liked cars', 'Close', { duration: 3000 });
      }
    });
  }

  navigateToModels(): void {
    this.router.navigate(['/models']);
  }
}
