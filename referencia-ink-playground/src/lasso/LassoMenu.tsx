// Lasso selection menu overlay component
// Displays action buttons when a valid lasso selection is detected

import React, { useCallback, useEffect, useRef } from 'react';
import type { SelectionIntent, SelectionIntentAction } from './SelectionIntent';
import { getMenuAnchorPoint } from './SelectionIntent';
import type { Offset } from '../types';

export interface LassoMenuProps {
  /** The current selection intent (null if none) */
  intent: SelectionIntent | null;

  /** Callback when user selects an action */
  onAction: (action: SelectionIntentAction) => void;

  /** Function to convert canvas coordinates to screen coordinates */
  canvasToScreen: (point: Offset) => Offset;
}

const MENU_OFFSET_Y = -50; // Position menu above the lasso

export function LassoMenu({
  intent,
  onAction,
  canvasToScreen,
}: LassoMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to dismiss
  useEffect(() => {
    if (!intent) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onAction('dismiss');
      }
    };

    // Handle escape key to dismiss
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onAction('dismiss');
      }
    };

    // Add listeners after a short delay to avoid immediate dismissal
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [intent, onAction]);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('select');
  }, [onAction]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('delete');
  }, [onAction]);

  if (!intent || intent.selectedElements.length === 0) {
    return null;
  }

  // Calculate menu position
  const anchorCanvas = getMenuAnchorPoint(intent);
  const anchorScreen = canvasToScreen(anchorCanvas);
  const menuX = anchorScreen.x;
  const menuY = anchorScreen.y + MENU_OFFSET_Y;

  const elementCount = intent.selectedElements.length;
  const elementText = elementCount === 1 ? '1 element' : `${elementCount} elements`;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        left: menuX,
        top: menuY,
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        {/* Header showing element count */}
        <div
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            color: '#666',
            borderBottom: '1px solid #e0e0e0',
            width: '100%',
            textAlign: 'center',
            backgroundColor: '#f8f8f8',
          }}
        >
          {elementText}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <MenuButton
            icon="check"
            label="Select"
            onClick={handleSelect}
          />
          <div
            style={{
              width: '1px',
              backgroundColor: '#e0e0e0',
            }}
          />
          <MenuButton
            icon="trash"
            label="Delete"
            onClick={handleDelete}
            danger
          />
        </div>
      </div>

      {/* Tooltip arrow pointing down */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '-8px',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
          filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))',
        }}
      />
    </div>
  );
}

interface MenuButtonProps {
  icon: 'check' | 'trash';
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}

function MenuButton({ icon, label, onClick, danger }: MenuButtonProps) {
  const iconElement = icon === 'check' ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 16px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: danger ? '#dc3545' : '#333',
        gap: '4px',
        transition: 'background-color 0.15s',
        minWidth: '64px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? '#fff5f5' : '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {iconElement}
      <span style={{ fontSize: '11px' }}>{label}</span>
    </button>
  );
}

export default LassoMenu;
