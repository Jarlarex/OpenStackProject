import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModelService } from '../../services/model.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-model-form',
  standalone: true,
  imports: [ MatFormFieldModule, MatInputModule, MatButtonModule, MatError, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './model-form.component.html',
  styleUrls: ['./model-form.component.scss'],
})
export class ModelFormComponent implements OnInit {
  modelForm!: FormGroup;
  isEditMode: boolean = false;
  modelId!: string;

  constructor(
    private fb: FormBuilder,
    private modelService: ModelService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe((params) => {
      this.modelId = params.get('id') || '';
      if (this.modelId) {
        this.isEditMode = true;
        this.loadModelData();
      }
    });
  }

  initializeForm(): void {
    this.modelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      yearIntroduced: [null, [Validators.required, Validators.min(1900)]],
      yearDiscontinued: [null, [Validators.required, Validators.max(2025)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  loadModelData(): void {
    this.modelService.getModelById(this.modelId).subscribe({
      next: (data) => this.modelForm.patchValue(data),
      error: (err) => {
        this.snackBar.open('Failed to load model data', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  getFieldErrors(fieldName: string): string[] {
    const field = this.modelForm.get(fieldName);
    return field && field.errors ? Object.keys(field.errors) : [];
  }

  onSubmit(): void {
    if (this.modelForm.invalid) {
      return;
    }

    const modelData = {
      name: this.modelForm.get('name')?.value.trim(),
      yearIntroduced: this.modelForm.get('yearIntroduced')?.value,
      yearDiscontinued: this.modelForm.get('yearDiscontinued')?.value || null,
      description: this.modelForm.get('description')?.value.trim() || '',
    };

    if (this.isEditMode) {
      this.modelService.updateModel(this.modelId, modelData).subscribe({
        next: () => {
          this.snackBar.open('Model updated successfully', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/models']);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to update model', 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
      });
    } else {
      this.modelService.createModel(modelData).subscribe({
        next: () => {
          this.snackBar.open('Model created successfully', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/models']);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to create model', 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
      });
    }
  }
}
