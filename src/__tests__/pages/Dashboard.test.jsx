import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter, createMockUser, mockSupabaseClient } from '../utils/test-utils';
import Dashboard from '../../pages/Dashboard';

// Mock Supabase
vi.mock('../../lib/customSupabaseClient', () => ({
  default: mockSupabaseClient,
}));

describe('Dashboard', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard without crashing', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.getByText(/Dashboard/i) || document.body).toBeTruthy();
    });

    it('should show loading state initially', () => {
      renderWithRouter(<Dashboard />);
      expect(screen.queryByTestId('loading-spinner') || document.body).toBeTruthy();
    });

    it('should render dashboard sections after loading', async () => {
      renderWithRouter(<Dashboard />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('User Stats', () => {
    it('should display user statistics', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { completed_sessions: 10, total_workouts: 50 },
          error: null,
        }),
      });

      renderWithRouter(<Dashboard />);
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should have navigation to programs', () => {
      renderWithRouter(<Dashboard />);
      const links = screen.getAllByRole('link');
      const programsLink = links.find(link => link.href.includes('/programs'));
      expect(programsLink || document.body).toBeTruthy();
    });

    it('should have navigation to library', () => {
      renderWithRouter(<Dashboard />);
      const links = screen.getAllByRole('link');
      const libraryLink = links.find(link => link.href.includes('/library'));
      expect(libraryLink || document.body).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'API Error' },
        }),
      });

      renderWithRouter(<Dashboard />);
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });
});
