
// src/app/shared/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const valid = hasNumber && hasUpper && hasLower && hasSpecial && value.length >= 8;

    if (!valid) {
      return {
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial,
          minLength: value.length >= 8
        }
      };
    }
    return null;
  }

  static confirmPasswordValidator(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordControlName);
      const confirmPassword = control.value;

      if (!password || !confirmPassword) return null;

      return password.value === confirmPassword ? null : { mismatch: true };
    };
  }

  static usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const valid = /^[a-zA-Z0-9._-]+$/.test(value);
    return valid ? null : { invalidUsername: true };
  }

  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasWhitespace = /\s/.test(value);
    return hasWhitespace ? { whitespace: true } : null;
  }
}