import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../core/models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  updatingProfile = false;
  changingPassword = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value !== confirmPassword.value
      ? { passwordMismatch: true } : null;
  }

  private loadProfile(): void {
    this.loading = true;
    this.userService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile: UserProfile) => {
          this.userProfile = profile;
          this.profileForm.patchValue(profile);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar el perfil', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  updateProfile(): void {
    if (!this.profileForm.valid) return;
    this.updatingProfile = true;

    const updateData: UpdateProfileRequest = this.profileForm.value;
    this.userService.updateProfile(updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updatingProfile = false)
      )
      .subscribe({
        next: ({ user, token }) => {
          this.authService.setToken(token);
          this.authService.updateCurrentUser(user);
          this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        })
      });
  }

  changePassword(): void {
    if (!this.passwordForm.valid) return;
    this.changingPassword = true;

    const req: ChangePasswordRequest = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(req)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.changingPassword = false)
      )
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: () => this.snackBar.open('Error al cambiar la contraseña', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        })
      });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';
    const errors = field.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    return 'Campo inválido';
  }
}
