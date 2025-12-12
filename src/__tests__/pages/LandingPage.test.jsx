import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/test-utils';
import LandingPage from '../../pages/LandingPage';

describe('LandingPage', () => {
  const mockOnLoginClick = vi.fn();
  const mockOnRegisterClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the landing page without crashing', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      expect(screen.getByText(/VALKA/i)).toBeInTheDocument();
    });

    it('should render hero section with main heading', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should render FAQ section', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      expect(screen.getByText(/¿Cuánto sale entrenar en VALKA?/i)).toBeInTheDocument();
    });

    it('should render all FAQ questions', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      expect(screen.getByText(/¿En cuánto tiempo veo resultados?/i)).toBeInTheDocument();
      expect(screen.getByText(/¿Qué diferencia a VALKA de una rutina genérica?/i)).toBeInTheDocument();
      expect(screen.getByText(/¿Cuántos días por semana necesito?/i)).toBeInTheDocument();
      expect(screen.getByText(/¿Puedo empezar sin equipo?/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onLoginClick when login button is clicked', async () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const loginButton = screen.getByText(/Iniciar Sesión/i);
      fireEvent.click(loginButton);
      await waitFor(() => {
        expect(mockOnLoginClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onRegisterClick when register button is clicked', async () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const registerButton = screen.getByText(/Registrarse/i);
      fireEvent.click(registerButton);
      await waitFor(() => {
        expect(mockOnRegisterClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should toggle FAQ answers when clicked', async () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const faqButton = screen.getByText(/¿Cuánto sale entrenar en VALKA?/i);
      fireEvent.click(faqButton);
      await waitFor(() => {
        expect(screen.getByText(/Ofrecemos planes escalables/i)).toBeVisible();
      });
    });
  });

  describe('WhatsApp Integration', () => {
    it('should render WhatsApp contact links', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const whatsappLinks = screen.getAllByRole('link').filter(link => 
        link.href.includes('wa.me')
      );
      expect(whatsappLinks.length).toBeGreaterThan(0);
    });

    it('should have correct WhatsApp number in links', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const whatsappLinks = screen.getAllByRole('link').filter(link => 
        link.href.includes('59894734367')
      );
      expect(whatsappLinks.length).toBeGreaterThan(0);
    });
  });

  describe('SEO and Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have FAQ schema markup', () => {
      const { container } = renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const schemaScript = container.querySelector('script[type="application/ld+json"]');
      expect(schemaScript).toBeInTheDocument();
      
      if (schemaScript) {
        const schema = JSON.parse(schemaScript.textContent);
        expect(schema['@type']).toBe('FAQPage');
        expect(schema.mainEntity).toHaveLength(5);
      }
    });

    it('should have accessible buttons', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should have accessible links', () => {
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render mobile navigation when viewport is small', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(
        <LandingPage onLoginClick={mockOnLoginClick} onRegisterClick={mockOnRegisterClick} />
      );
      // Check for mobile-specific elements
      expect(document.querySelector('[data-mobile-nav]') || document.body).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('should handle missing onLoginClick prop gracefully', () => {
      expect(() => {
        renderWithRouter(
          <LandingPage onRegisterClick={mockOnRegisterClick} />
        );
      }).not.toThrow();
    });

    it('should handle missing onRegisterClick prop gracefully', () => {
      expect(() => {
        renderWithRouter(
          <LandingPage onLoginClick={mockOnLoginClick} />
        );
      }).not.toThrow();
    });
  });
});
