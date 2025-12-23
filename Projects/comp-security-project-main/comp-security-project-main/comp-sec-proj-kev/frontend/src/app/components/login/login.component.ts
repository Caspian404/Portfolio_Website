import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  recaptchaError = '';
  private recaptchaToken: string | null = null;
  private recaptchaWidgetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Setup global reCAPTCHA callbacks
    (window as any).onRecaptchaSuccess = (token: string) => {
      this.recaptchaToken = token;
      this.recaptchaError = '';
    };
    (window as any).onRecaptchaExpired = () => {
      this.recaptchaToken = null;
      this.recaptchaError = 'reCAPTCHA expired. Please verify again.';
    };
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit(): void {
    // Render reCAPTCHA explicitly after view initializes
    this.renderRecaptcha();
  }

  private renderRecaptcha(): void {
    // Check if grecaptcha is loaded
    if (typeof (window as any).grecaptcha === 'undefined') {
      // If not loaded, wait and try again
      setTimeout(() => this.renderRecaptcha(), 100);
      return;
    }

    // Wait for grecaptcha.render to be available
    if (!(window as any).grecaptcha.render) {
      setTimeout(() => this.renderRecaptcha(), 100);
      return;
    }

    try {
      const recaptchaElement = document.getElementById('recaptcha-container');
      if (recaptchaElement && !this.recaptchaWidgetId) {
        this.recaptchaWidgetId = (window as any).grecaptcha.render('recaptcha-container', {
          'sitekey': '6LdJwS0sAAAAADkfdaY4QJobm0qQK2FnaYkpmrqF',
          'callback': (token: string) => {
            this.recaptchaToken = token;
            this.recaptchaError = '';
          },
          'expired-callback': () => {
            this.recaptchaToken = null;
            this.recaptchaError = 'reCAPTCHA expired. Please verify again.';
          }
        });
      }
    } catch (error) {
      console.error('Error rendering reCAPTCHA:', error);
      // Retry if there's an error
      setTimeout(() => this.renderRecaptcha(), 500);
    }
  }

  onSubmit(): void {
    if (!this.recaptchaToken) {
      this.recaptchaError = 'Please complete the reCAPTCHA verification.';
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.recaptchaError = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password, this.recaptchaToken).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          console.error('Login failed:', error);
          
          // Reset reCAPTCHA
          this.recaptchaToken = null;
          if (typeof (window as any).grecaptcha !== 'undefined' && this.recaptchaWidgetId !== null) {
            (window as any).grecaptcha.reset(this.recaptchaWidgetId);
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
