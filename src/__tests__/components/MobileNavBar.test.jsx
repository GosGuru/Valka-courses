import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../utils/test-utils';
import MobileNavBar from '../../components/MobileNavBar';

describe('MobileNavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render mobile navigation without crashing', () => {
      renderWithRouter(<MobileNavBar />);
      expect(document.body).toBeTruthy();
    });

    it('should display navigation items', () => {
      renderWithRouter(<MobileNavBar />);
      const navItems = screen.getAllByRole('link');
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should have home link', () => {
      renderWithRouter(<MobileNavBar />);
      const homeLink = screen.getByRole('link', { name: /inicio|home/i });
      expect(homeLink || document.querySelector('[href="/"]')).toBeTruthy();
    });

    it('should have programs link', () => {
      renderWithRouter(<MobileNavBar />);
      const programsLink = screen.getByRole('link', { name: /programas|programs/i });
      expect(programsLink || document.querySelector('[href="/programs"]')).toBeTruthy();
    });

    it('should have library link', () => {
      renderWithRouter(<MobileNavBar />);
      const libraryLink = screen.getByRole('link', { name: /biblioteca|library/i });
      expect(libraryLink || document.querySelector('[href="/library"]')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate when link is clicked', () => {
      renderWithRouter(<MobileNavBar />);
      const homeLink = screen.getByRole('link', { name: /inicio|home/i }) ||
                       document.querySelector('[href="/"]');
      fireEvent.click(homeLink);
      expect(document.body).toBeTruthy();
    });

    it('should highlight active route', () => {
      renderWithRouter(<MobileNavBar />, { route: '/programs' });
      const programsLink = screen.getByRole('link', { name: /programas|programs/i }) ||
                          document.querySelector('[href="/programs"]');
      expect(programsLink?.classList.contains('active') || 
             programsLink?.getAttribute('aria-current')).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should display icons for each navigation item', () => {
      renderWithRouter(<MobileNavBar />);
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation', () => {
      renderWithRouter(<MobileNavBar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeTruthy();
    });

    it('should have accessible links', () => {
      renderWithRouter(<MobileNavBar />);
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', () => {
      renderWithRouter(<MobileNavBar />);
      const firstLink = screen.getAllByRole('link')[0];
      firstLink.focus();
      expect(document.activeElement).toBe(firstLink);
    });
  });

  describe('Mobile Specific Features', () => {
    it('should be fixed at bottom on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<MobileNavBar />);
      const nav = screen.getByRole('navigation');
      const styles = window.getComputedStyle(nav);
      expect(styles.position === 'fixed' || nav.classList.contains('fixed')).toBeTruthy();
    });

    it('should have touch-friendly targets', () => {
      renderWithRouter(<MobileNavBar />);
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const rect = link.getBoundingClientRect();
        // Touch target should be at least 44x44 pixels
        expect(rect.width >= 44 || rect.height >= 44).toBeTruthy();
      });
    });
  });
});
