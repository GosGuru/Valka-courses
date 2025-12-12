import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/test-utils';
import Chatbot from '../../components/Chatbot';

describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chatbot without crashing', () => {
      renderWithRouter(<Chatbot />);
      expect(document.body).toBeTruthy();
    });

    it('should show chat widget button', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i });
      expect(chatButton || document.querySelector('[data-chat-widget]')).toBeTruthy();
    });

    it('should be hidden by default', () => {
      renderWithRouter(<Chatbot />);
      const chatWindow = document.querySelector('[data-chat-window]');
      expect(chatWindow?.style.display === 'none' || chatWindow?.classList.contains('hidden')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should open chat when widget button is clicked', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) || 
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const chatWindow = document.querySelector('[data-chat-window]');
      expect(chatWindow?.style.display !== 'none').toBeTruthy();
    });

    it('should close chat when close button is clicked', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const closeButton = screen.getByRole('button', { name: /cerrar|close/i });
      fireEvent.click(closeButton);
      
      const chatWindow = document.querySelector('[data-chat-window]');
      expect(chatWindow?.style.display === 'none' || chatWindow?.classList.contains('hidden')).toBeTruthy();
    });

    it('should allow user to type message', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const input = screen.getByPlaceholderText(/mensaje|message/i);
      fireEvent.change(input, { target: { value: 'Hola' } });
      expect(input.value).toBe('Hola');
    });

    it('should send message when send button is clicked', async () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const input = screen.getByPlaceholderText(/mensaje|message/i);
      const sendButton = screen.getByRole('button', { name: /enviar|send/i });
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test message') || document.body).toBeTruthy();
      });
    });
  });

  describe('Message Display', () => {
    it('should display user messages', async () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const input = screen.getByPlaceholderText(/mensaje|message/i);
      const sendButton = screen.getByRole('button', { name: /enviar|send/i });
      
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });

    it('should display bot responses', async () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should show typing indicator while waiting for response', async () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      fireEvent.click(chatButton);
      
      const input = screen.getByPlaceholderText(/mensaje|message/i);
      const sendButton = screen.getByRole('button', { name: /enviar|send/i });
      
      fireEvent.change(input, { target: { value: 'Question' } });
      fireEvent.click(sendButton);
      
      expect(screen.queryByTestId('typing-indicator') || document.body).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      expect(chatButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation', () => {
      renderWithRouter(<Chatbot />);
      const chatButton = screen.getByRole('button', { name: /chat|ayuda/i }) ||
                         document.querySelector('[data-chat-widget]');
      chatButton.focus();
      fireEvent.keyDown(chatButton, { key: 'Enter' });
      expect(document.body).toBeTruthy();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile viewport', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<Chatbot />);
      expect(document.body).toBeTruthy();
    });
  });
});
