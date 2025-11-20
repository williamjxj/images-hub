'use client';

/**
 * Main chat widget component that combines icon and panel
 */

import { useState } from 'react';
import { ChatWidgetIcon } from './chat-widget-icon';
import { ChatWidgetPanel } from './chat-widget-panel';

/**
 * Chat widget component that appears on all pages
 * Icon and panel toggle visibility - only one is visible at a time
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && <ChatWidgetIcon onClick={toggleWidget} isOpen={isOpen} />}
      {isOpen && <ChatWidgetPanel isOpen={isOpen} onClose={closeWidget} />}
    </>
  );
}

