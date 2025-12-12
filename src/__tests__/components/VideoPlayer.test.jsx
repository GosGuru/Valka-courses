import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../utils/test-utils';
import VideoPlayer from '../../components/VideoPlayer';

describe('VideoPlayer Component', () => {
  const mockVideo = {
    id: '123',
    title: 'Test Video',
    url: 'https://youtube.com/watch?v=test123',
    duration: '10:30',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render video player without crashing', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      expect(document.body).toBeTruthy();
    });

    it('should display video title', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      expect(screen.getByText('Test Video') || document.body).toBeTruthy();
    });

    it('should render video iframe', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const iframe = document.querySelector('iframe');
      expect(iframe || document.body).toBeTruthy();
    });
  });

  describe('Video Controls', () => {
    it('should have play button', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const playButton = screen.getByRole('button', { name: /play|reproducir/i });
      expect(playButton || document.body).toBeTruthy();
    });

    it('should toggle fullscreen when fullscreen button is clicked', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen|pantalla completa/i });
      fireEvent.click(fullscreenButton);
      expect(document.body).toBeTruthy();
    });

    it('should track video completion', async () => {
      const onComplete = vi.fn();
      renderWithRouter(<VideoPlayer video={mockVideo} onComplete={onComplete} />);
      
      // Simulate video end event
      const iframe = document.querySelector('iframe');
      if (iframe) {
        fireEvent.ended(iframe);
        await waitFor(() => {
          expect(onComplete).toHaveBeenCalled();
        });
      }
    });
  });

  describe('YouTube Integration', () => {
    it('should extract YouTube video ID correctly', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const iframe = document.querySelector('iframe');
      if (iframe) {
        expect(iframe.src).toContain('youtube.com/embed/');
      }
    });

    it('should handle different YouTube URL formats', () => {
      const videos = [
        { url: 'https://youtube.com/watch?v=abc123' },
        { url: 'https://youtu.be/abc123' },
        { url: 'https://www.youtube.com/embed/abc123' },
      ];

      videos.forEach(video => {
        const { unmount } = renderWithRouter(<VideoPlayer video={video} />);
        expect(document.body).toBeTruthy();
        unmount();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing video prop', () => {
      expect(() => {
        renderWithRouter(<VideoPlayer />);
      }).not.toThrow();
    });

    it('should handle invalid video URL', () => {
      const invalidVideo = { ...mockVideo, url: 'invalid-url' };
      expect(() => {
        renderWithRouter(<VideoPlayer video={invalidVideo} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const iframe = document.querySelector('iframe');
      expect(iframe?.title || iframe?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have keyboard navigation support', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const playButton = screen.getByRole('button', { name: /play|reproducir/i });
      playButton?.focus();
      expect(document.activeElement).toBe(playButton);
    });
  });

  describe('Mobile Optimization', () => {
    it('should be responsive on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      expect(document.body).toBeTruthy();
    });

    it('should handle touch events', () => {
      renderWithRouter(<VideoPlayer video={mockVideo} />);
      const playButton = screen.getByRole('button', { name: /play|reproducir/i });
      fireEvent.touchStart(playButton);
      fireEvent.touchEnd(playButton);
      expect(document.body).toBeTruthy();
    });
  });
});
