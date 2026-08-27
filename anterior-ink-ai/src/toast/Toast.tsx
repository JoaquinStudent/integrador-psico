/*
 * Lightweight imperative toast system.
 *
 * Usage:
 *   import { showToast } from '../toast/Toast';
 *   showToast('Something went wrong');
 *
 * Mount <Toaster /> once at the app root to render messages.
 */

import { useState, useEffect, useCallback } from 'react';
import './toast.css';

interface ToastEntry {
  id: number;
  message: string;
  exiting: boolean;
}

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 300;

type Listener = () => void;

let nextId = 0;
let entries: ToastEntry[] = [];
const listeners = new Set<Listener>();

function notify(): void {
  for (const fn of listeners) fn();
}

export function showToast(message: string): void {
  const id = nextId++;
  entries = [...entries, { id, message, exiting: false }];
  notify();

  setTimeout(() => {
    entries = entries.map(e => (e.id === id ? { ...e, exiting: true } : e));
    notify();

    setTimeout(() => {
      entries = entries.filter(e => e.id !== id);
      notify();
    }, EXIT_ANIMATION_MS);
  }, AUTO_DISMISS_MS);
}

export function Toaster(): React.ReactElement | null {
  const [, forceRender] = useState(0);

  const refresh = useCallback(() => forceRender(n => n + 1), []);

  useEffect(() => {
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  if (entries.length === 0) return null;

  return (
    <div className="toast-container">
      {entries.map(entry => (
        <div
          key={entry.id}
          className={`toast-message ${entry.exiting ? 'toast-exit' : 'toast-enter'}`}
        >
          {entry.message}
        </div>
      ))}
    </div>
  );
}
