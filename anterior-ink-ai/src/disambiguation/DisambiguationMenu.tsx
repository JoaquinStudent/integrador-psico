// Disambiguation menu overlay component
// Displays element type options when multiple elements are viable candidates

import React, { useCallback, useEffect, useRef } from 'react';
import type { DisambiguationIntent, DisambiguationAction, DisambiguationCandidate } from './DisambiguationIntent';
import type { Offset } from '../types';
import type { ShapeType } from '../geometry/shapeRecognition';

// Element type identifiers
type ElementTypeIcon = ShapeType | 'inktext' | 'tictactoe';

export interface DisambiguationMenuProps {
  /** The current disambiguation intent (null if none) */
  intent: DisambiguationIntent | null;

  /** Callback when user selects an action */
  onAction: (action: DisambiguationAction, selectedCandidate?: DisambiguationCandidate) => void;

  /** Function to convert canvas coordinates to screen coordinates */
  canvasToScreen: (point: Offset) => Offset;
}

const MENU_OFFSET_Y = -60; // Position menu above the strokes

export function DisambiguationMenu({
  intent,
  onAction,
  canvasToScreen,
}: DisambiguationMenuProps) {
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

  const handleSelectCandidate = useCallback((e: React.MouseEvent, candidate: DisambiguationCandidate) => {
    e.stopPropagation();
    onAction('select', candidate);
  }, [onAction]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('dismiss');
  }, [onAction]);

  if (!intent || intent.candidates.length === 0) {
    return null;
  }

  // Calculate menu position
  const anchorScreen = canvasToScreen(intent.anchorPoint);
  const menuX = anchorScreen.x;
  const menuY = anchorScreen.y + MENU_OFFSET_Y;

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
        {/* Header */}
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
          Please choose...
        </div>

        {/* Element candidate buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {intent.candidates.map((candidate, index) => (
            <React.Fragment key={`${candidate.elementType}-${candidate.shapeType ?? index}`}>
              {index > 0 && (
                <div
                  style={{
                    width: '1px',
                    backgroundColor: '#e0e0e0',
                  }}
                />
              )}
              <CandidateButton
                candidate={candidate}
                onClick={(e) => handleSelectCandidate(e, candidate)}
              />
            </React.Fragment>
          ))}
          {/* Dismiss button (X) */}
          <div
            style={{
              width: '1px',
              backgroundColor: '#e0e0e0',
            }}
          />
          <button
            onClick={handleDismiss}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#999',
              gap: '4px',
              transition: 'background-color 0.15s',
              minWidth: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Keep as strokes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span style={{ fontSize: '10px' }}>Cancel</span>
          </button>
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

interface CandidateButtonProps {
  candidate: DisambiguationCandidate;
  onClick: (e: React.MouseEvent) => void;
}

function CandidateButton({ candidate, onClick }: CandidateButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 12px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#333',
        gap: '4px',
        transition: 'background-color 0.15s',
        minWidth: '56px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f0f7ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={`${candidate.label} (${Math.round(candidate.confidence * 100)}%)`}
    >
      <ElementIcon icon={candidate.icon as ElementTypeIcon} />
      <span style={{ fontSize: '10px' }}>{candidate.label}</span>
    </button>
  );
}

interface ElementIconProps {
  icon: ElementTypeIcon;
}

/**
 * Render an icon for any element type.
 * Dispatches to appropriate icon based on element type.
 */
function ElementIcon({ icon }: ElementIconProps) {
  // Check for non-shape element types first
  if (icon === 'inktext') {
    return <InkTextIcon />;
  }
  if (icon === 'tictactoe') {
    return <TicTacToeIcon />;
  }
  // Default to shape icon
  return <ShapeIcon shapeType={icon as ShapeType} />;
}

/**
 * Icon for InkText element type (stylized "Aa" text).
 */
function InkTextIcon() {
  const size = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <text
        x="2"
        y="18"
        fontSize="14"
        fontWeight="bold"
        fontFamily="serif"
        fill="currentColor"
      >
        Aa
      </text>
    </svg>
  );
}

/**
 * Icon for TicTacToe element type (grid with X and O).
 */
function TicTacToeIcon() {
  const size = 20;
  const strokeWidth = 1.5;
  const color = 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
      {/* Grid lines */}
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      {/* X in top-left */}
      <line x1="5" y1="5" x2="7" y2="7" strokeWidth="1" />
      <line x1="7" y1="5" x2="5" y2="7" strokeWidth="1" />
      {/* O in center */}
      <circle cx="12" cy="12" r="2" strokeWidth="1" />
    </svg>
  );
}

interface ShapeIconProps {
  shapeType: ShapeType;
}

function ShapeIcon({ shapeType }: ShapeIconProps) {
  const size = 20;
  const strokeWidth = 1.5;
  const color = 'currentColor';

  switch (shapeType) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );

    case 'rectangle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <rect x="4" y="6" width="16" height="12" rx="1" />
        </svg>
      );

    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <polygon points="12,4 21,20 3,20" />
        </svg>
      );

    case 'pentagon': {
      // 5-sided regular polygon
      const points = generatePolygonPoints(5, 10, 12, 12);
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <polygon points={points} />
        </svg>
      );
    }

    case 'hexagon': {
      // 6-sided regular polygon
      const points = generatePolygonPoints(6, 10, 12, 12);
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <polygon points={points} />
        </svg>
      );
    }

    case 'octagon': {
      // 8-sided regular polygon
      const points = generatePolygonPoints(8, 10, 12, 12);
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <polygon points={points} />
        </svg>
      );
    }

    default:
      // Fallback: generic shape icon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
  }
}

/**
 * Generate SVG polygon points string for a regular n-sided polygon.
 */
function generatePolygonPoints(n: number, radius: number, cx: number, cy: number): string {
  const points: string[] = [];
  const startAngle = -Math.PI / 2; // Start at top

  for (let i = 0; i < n; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / n;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(' ');
}

export default DisambiguationMenu;
