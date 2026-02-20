import React from 'react';
import { useToast } from '../../context/ToastContext';

export default function ChatWidget() {
  const showToast = useToast();

  const handleClick = () => {
    showToast('Chat feature coming soon! For now, please call us at 1-800-FIBER-LINK', 'success');
  };

  return (
    <div className="chat-widget" id="chatWidget">
      <button className="chat-trigger" id="chatTrigger" aria-label="Open chat" onClick={handleClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
        <span className="chat-badge">1</span>
      </button>
    </div>
  );
}
