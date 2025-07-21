import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.interface';
import { CustomValidators } from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: [
        '', 
        [
          Validators.required,
          Validators.minLength(3),
          CustomValidators.noWhitespace
        ]
      ],
      password: [
        '', 
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    
    const loginData: LoginRequest = {
      emailOrUsername: this.loginForm.value.username.trim(),
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (this.loginForm.value.rememberMe) {
          localStorage.setItem('rememberUser', this.loginForm.value.username);
        }
        
        this.snackBar.open('¡Bienvenido!', 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(
          error.message || 'Error al iniciar sesión. Verifica tus credenciales.',
          'Cerrar',
          { 
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return `${this.getFieldLabel(fieldName)} es obligatorio`;
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Formato de email inválido';
    if (errors['whitespace']) return 'No puede contener espacios';
    if (errors['invalidUsername']) return 'Solo letras, números, puntos, guiones y guiones bajos';

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Usuario/Email',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}