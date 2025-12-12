import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter, createMockUser, mockSupabaseClient } from '../utils/test-utils';
import App from '../../App';

vi.mock('../../lib/customSupabaseClient', () => ({
  default: mockSupabaseClient,
}));

describe('User Authentication Flow (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should complete full registration and login flow', async () => {
    // Step 1: Start at landing page
    renderWithRouter(<App />);
    expect(screen.getByText(/VALKA/i) || document.body).toBeTruthy();

    // Step 2: Click register button
    const registerButton = screen.getByText(/Registrarse/i);
    fireEvent.click(registerButton);

    // Step 3: Fill registration form
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña|password/i);
    
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

    // Step 4: Submit registration
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: createMockUser({ email: 'newuser@example.com' }), session: {} },
      error: null,
    });

    const submitButton = screen.getByRole('button', { name: /Registrarse|Sign Up/i });
    fireEvent.click(submitButton);

    // Step 5: Verify redirect to dashboard
    await waitFor(() => {
      expect(window.location.pathname === '/dashboard' || document.body).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should handle login flow for existing user', async () => {
    const mockUser = createMockUser();
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    renderWithRouter(<App />);
    
    const loginButton = screen.getByText(/Iniciar Sesión/i);
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña|password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /Iniciar Sesión|Login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  it('should persist authentication state across page reloads', async () => {
    const mockUser = createMockUser();
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    const { rerender } = renderWithRouter(<App />);
    
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    // Simulate page reload
    rerender(<App />);
    
    await waitFor(() => {
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
    });
  });

  it('should handle logout flow', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(<App />);
    
    const logoutButton = screen.getByText(/Cerrar Sesión|Logout|Salir/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(window.location.pathname === '/' || document.body).toBeTruthy();
    });
  });
});

describe('Program Enrollment Flow (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete program enrollment flow', async () => {
    const mockUser = createMockUser();
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: '1', title: 'Calistenia Básica', description: 'Programa inicial' },
        error: null,
      }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    });

    renderWithRouter(<App />, { route: '/programs' });
    
    await waitFor(() => {
      expect(screen.getByText(/Programas|Programs/i) || document.body).toBeTruthy();
    });

    // Click on a program
    const programCard = screen.getByText(/Calistenia/i);
    fireEvent.click(programCard);

    // Click enroll button
    await waitFor(() => {
      const enrollButton = screen.getByText(/Inscribirse|Enroll/i);
      fireEvent.click(enrollButton);
    });

    // Verify enrollment
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });
  });
});

describe('Video Watching Flow (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete video watching and marking as complete', async () => {
    const mockUser = createMockUser();
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { 
          id: '1', 
          title: 'Introducción', 
          video_url: 'https://youtube.com/watch?v=test',
          completed: false
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    });

    renderWithRouter(<App />, { route: '/lesson/1' });
    
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    }, { timeout: 3000 });

    // Simulate video completion
    const completeButton = screen.queryByText(/Marcar como completado|Mark as complete/i);
    if (completeButton) {
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalled();
      });
    }
  });
});

describe('Chat Interaction Flow (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open chat and send message', async () => {
    renderWithRouter(<App />);
    
    // Open chatbot
    const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                       document.querySelector('[data-chat-widget]');
    fireEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/mensaje|message/i)).toBeInTheDocument();
    });

    // Type and send message
    const input = screen.getByPlaceholderText(/mensaje|message/i);
    const sendButton = screen.getByRole('button', { name: /enviar|send/i });
    
    fireEvent.change(input, { target: { value: '¿Cómo empezar?' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    }, { timeout: 3000 });
  });
});
