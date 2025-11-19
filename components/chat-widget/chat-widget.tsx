'use client';

/**
 * Main chat widget component that combines icon and panel
 */

import { useChatWidget } from '@/lib/hooks/use-chat-widget';
import { ChatWidgetIcon } from './chat-widget-icon';
import { ChatWidgetPanel } from './chat-widget-panel';

/**
 * Chat widget component that appears on all pages
 */
export function ChatWidget() {
  const { isOpen, openWidget, closeWidget, toggleWidget } = useChatWidget();

  return (
    <>
      <ChatWidgetIcon onClick={toggleWidget} isOpen={isOpen} />
      <ChatWidgetPanel isOpen={isOpen} onClose={closeWidget} />
    </>
  );
}

