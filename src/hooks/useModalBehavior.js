import { useEffect } from 'react';

/**
 * Custom hook to ensure all modal dialogs close reliably:
 * - Listens for 'Escape' key
 * - Locks background scroll while open
 * - Returns a backdrop click handler
 * 
 * @param {boolean} isOpen
 * @param {Function} onClose
 */
export function useModalBehavior(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onClose) onClose();
    }
  };

  return { handleBackdropClick };
}
