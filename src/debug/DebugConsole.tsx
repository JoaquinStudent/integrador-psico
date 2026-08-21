// Debug console overlay component - shows recent log messages

import { useState, useEffect, useRef, useCallback } from 'react';
import { debugLog, type DebugLogEntry } from './DebugLogger';

interface DebugConsoleProps {
  visible: boolean;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 800;
const DEFAULT_HEIGHT = 120;

export function DebugConsole({ visible }: DebugConsoleProps) {
  const [entries, setEntries] = useState<DebugLogEntry[]>([]);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    if (!visible) return;

    const unsubscribe = debugLog.subscribe(setEntries);
    return unsubscribe;
  }, [visible]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
  }, [height]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragStartHeight.current + deltaY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleClear = useCallback(() => {
    debugLog.clear();
  }, []);

  const handleCopy = useCallback(() => {
    const text = entries.map(entry => {
      const time = entry.timestamp.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      const level = entry.level === 'error' ? 'ERR' : entry.level === 'warn' ? 'WRN' : entry.level === 'action' ? 'ACT' : 'INF';
      const data = entry.data !== undefined && entry.data !== null
        ? typeof entry.data === 'object'
          ? ` [${Object.entries(entry.data as Record<string, unknown>).map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' ')}]`
          : ` [${entry.data}]`
        : '';
      return `${time} [${level}] ${entry.message}${data}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
  }, [entries]);

  if (!visible) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLevelColor = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'error': return '#ff6b6b';
      case 'warn': return '#ffd93d';
      case 'action': return '#6bcb77';
      case 'info': default: return '#a8a8a8';
    }
  };

  const getLevelPrefix = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'error': return 'ERR';
      case 'warn': return 'WRN';
      case 'action': return 'ACT';
      case 'info': default: return 'INF';
    }
  };

  const formatData = (data: unknown): string => {
    if (data === undefined || data === null) return '';
    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const parts = Object.entries(obj)
        .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join(' ');
      return parts ? ` [${parts}]` : '';
    }
    return ` [${data}]`;
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 8,
      right: 8,
      width: 600,
      height: height,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 10,
      color: '#e0e0e0',
      overflow: 'hidden',
      zIndex: 1000,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          height: 6,
          cursor: 'ns-resize',
          backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{
          width: 40,
          height: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
        }} />
      </div>
      {/* Header */}
      <div style={{
        padding: '4px 8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#888',
        fontSize: 9,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>Debug Console</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{entries.length} messages</span>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              color: '#888',
              fontSize: 9,
              padding: '2px 6px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
          >
            Copy
          </button>
          <button
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              color: '#888',
              fontSize: 9,
              padding: '2px 6px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
          >
            Clear
          </button>
        </div>
      </div>
      {/* Log entries */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '2px 8px',
      }}>
        {entries.length === 0 ? (
          <div style={{ color: '#666', padding: '4px 0' }}>No messages yet</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{
              padding: '1px 0',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#666' }}>{formatTime(entry.timestamp)}</span>
              {' '}
              <span style={{ color: getLevelColor(entry.level) }}>[{getLevelPrefix(entry.level)}]</span>
              {' '}
              <span>{entry.message}</span>
              <span style={{ color: '#888' }}>{formatData(entry.data)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
