import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AccountService } from 'src/app/Services/account.service';
import { PasswordStrengthValidator } from 'src/app/Services/passwordStrengthValidator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;
  
  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
      }

  initializeForm() {
    this.registerForm = this.fb.group({
      Gender: ['', Validators.required],
      username: ['', Validators.required, this.usernameExistsValidator],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: [
        '',
        [Validators.required, PasswordStrengthValidator],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () =>
        this.registerForm.controls['confirmPassword'].updateValueAndValidity(),
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { notMatching: true };
    };
  }

  register() {
    const dob = this.getDateOnly(
      this.registerForm.controls['dateOfBirth'].value
    );
    const values = { ...this.registerForm.value, dateOfBirth: dob };
    this.accountService.register(values).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
      },
      error: (error) => {
        this.validationErrors = error;
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    let thedob = new Date(dob);
    let dateOnly = new Date(
      thedob.setMinutes(thedob.getMinutes() - thedob.getTimezoneOffset())
    );
    return dateOnly.toISOString().slice(0, 10);
  }

  usernameExistsValidator: AsyncValidatorFn = (
    control: AbstractControl
  ): Observable<ValidationErrors | null> => {
    const username = control.value;
    return this.accountService.checkUsername(username).pipe(
      map((exists) => (exists ? { usernameExists: true } : null)),
      catchError(() => of(null)) // Handle potential errors gracefully
    );
  };
}
