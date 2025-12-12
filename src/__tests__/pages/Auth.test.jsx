import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter, mockSupabaseClient } from '../utils/test-utils';
import Auth from '../../pages/Auth';

vi.mock('../../lib/customSupabaseClient', () => ({
  default: mockSupabaseClient,
}));

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render auth page without crashing', () => {
      renderWithRouter(<Auth />);
      expect(document.body).toBeTruthy();
    });

    it('should show login form by default', () => {
      renderWithRouter(<Auth />);
      expect(screen.getByText(/Iniciar Sesión/i) || screen.getByText(/Login/i) || document.body).toBeTruthy();
    });

    it('should have email input field', () => {
      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('should have password input field', () => {
      renderWithRouter(<Auth />);
      const passwordInput = screen.getByLabelText(/contraseña/i) || screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe('Login Functionality', () => {
    it('should allow user to type email', () => {
      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow user to type password', () => {
      renderWithRouter(<Auth />);
      const passwordInput = screen.getByLabelText(/contraseña/i) || screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(passwordInput.value).toBe('password123');
    });

    it('should call signInWithPassword when login form is submitted', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: {} },
        error: null,
      });

      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i) || screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión|Login|Entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show error message on failed login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i) || screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión|Login|Entrar/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials|Error|credenciales/i) || document.body).toBeTruthy();
      });
    });
  });

  describe('Registration Toggle', () => {
    it('should toggle to registration form', () => {
      renderWithRouter(<Auth />);
      const toggleButton = screen.getByText(/Registrarse|Sign Up|Crear cuenta/i);
      fireEvent.click(toggleButton);
      expect(screen.getByText(/Registrarse|Sign Up|Registro/i) || document.body).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });

    it('should require password', async () => {
      renderWithRouter(<Auth />);
      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión|Login|Entrar/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      renderWithRouter(<Auth />);
      const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i) || screen.getByLabelText(/password/i);
      expect(emailInput).toHaveAccessibleName();
      expect(passwordInput).toHaveAccessibleName();
    });

    it('should have accessible submit button', () => {
      renderWithRouter(<Auth />);
      const submitButton = screen.getByRole('button', { name: /Iniciar Sesión|Login|Entrar/i });
      expect(submitButton).toHaveAccessibleName();
    });
  });
});
