// Simple toast notification for kids — big text, fun colors
let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; flex-direction: column; gap: 8px;
      align-items: center; pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'success') {
  const colors = {
    success: { bg: '#4caf50', border: '#2e7d32' },
    warning: { bg: '#ff9800', border: '#f57c00' },
    error: { bg: '#e53935', border: '#b71c1c' },
    info: { bg: '#2196f3', border: '#1565c0' },
  };
  const { bg, border } = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    background: ${bg}; color: white; padding: 12px 24px;
    border-radius: 10px; border: 3px solid ${border};
    font-size: 18px; font-weight: bold; pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    animation: toastSlide 0.3s ease-out;
    text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
  `;

  getContainer().appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Inject animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes toastSlide {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
