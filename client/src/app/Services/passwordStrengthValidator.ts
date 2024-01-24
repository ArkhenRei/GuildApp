import { AbstractControl, ValidationErrors } from '@angular/forms';

export const PasswordStrengthValidator = function (
  control: AbstractControl
): ValidationErrors | null {
  let value: string = control.value || '';
  if (!value) {
    return null;
  }

  let minLength = /.{7,}\S$/
  let upperCaseCharacters = /[A-Z]+/g;
  let lowerCaseCharacters = /[a-z]+/g;
  let numberCharacters = /[0-9]+/g;
  let specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (upperCaseCharacters.test(value) === false) {
    return {
      passwordStrength: 'Password must contain at 1 uppercase letter',
    };
  }
  if (lowerCaseCharacters.test(value) === false) {
    return {
      passwordStrength: 'Password must contain at 1 lowercase letter',
    };
  }
  if (numberCharacters.test(value) === false) {
    return {
      passwordStrength: 'Password must contain at 1 number',
    };
  }
  if (specialCharacters.test(value) === false) {
    return {
      passwordStrength: 'Password must contain at 1 special character',
    };
  }
  if(minLength.test(value) === false){
    return {
        passwordStrength: 'Password must be at least 8 characters long'
    }
  }
  return null;
};
