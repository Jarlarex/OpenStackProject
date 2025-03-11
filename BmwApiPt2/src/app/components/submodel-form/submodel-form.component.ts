import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmodelService } from '../../services/submodel.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-submodel-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './submodel-form.component.html',
  styleUrls: ['./submodel-form.component.css'],
})
export class SubmodelFormComponent implements OnInit {
  submodelForm!: FormGroup;
  isEditMode: boolean = false;
  submodelId!: string;
  modelId!: string;

  constructor(
    private fb: FormBuilder,
    private submodelService: SubmodelService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe((params) => {
      this.modelId = params.get('id') || '';
      this.submodelId = params.get('submodelId') || '';
      if (this.submodelId) {
        this.isEditMode = true;
        this.loadSubmodelData();
      }
    });
  }

  initializeForm(): void {
    this.submodelForm = this.fb.group({
      _id: [''], // Add _id field
      name: ['', [Validators.required, Validators.minLength(3)]],
      engineType: ['', Validators.required],
      horsepower: [null, [Validators.required, Validators.min(50)]],
      torque: [null, [Validators.required, Validators.min(50)]],
      transmission: ['', Validators.required],
      year: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      imageURL: ['', Validators.required],
    });
  }

  loadSubmodelData(): void {
    if (!this.modelId || !this.submodelId) {
      this.snackBar.open('Model ID or Submodel ID is missing', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.submodelService.getSubmodelById(this.modelId, this.submodelId).subscribe({
      next: (data) => {
        this.submodelForm.patchValue(data);
      },
      error: (err) => {
        this.snackBar.open('Failed to load submodel data. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  onSubmit(): void {
    if (this.submodelForm.invalid) {
      return;
    }

    const submodelData = { ...this.submodelForm.value };

    if (this.isEditMode) {
      this.submodelService.updateSubmodel(this.modelId, this.submodelId, submodelData).subscribe({
        next: () => {
          this.snackBar.open('Submodel updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/models']);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to update submodel', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
      });
    } else {
      this.submodelService.addSubmodel(this.modelId, submodelData).subscribe({
        next: () => {
          this.snackBar.open('Submodel created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/models']);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to create submodel', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
      });
    }
  }
}
