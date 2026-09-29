// Undo/Redo hook for managing state history

import { useState, useCallback, useEffect } from 'react';

export interface UndoRedoState<T> {
  current: T;
  canUndo: boolean;
  canRedo: boolean;
  set: (value: T) => void;
  undo: () => void;
  redo: () => void;
  reset: (value: T) => void;
}

export interface UndoRedoOptions {
  maxHistory?: number;
}

export function useUndoRedo<T>(
  initialValue: T,
  options: UndoRedoOptions = {}
): UndoRedoState<T> {
  const { maxHistory = 100 } = options;

  // Store everything in state so changes trigger re-renders
  const [state, setState] = useState<{
    current: T;
    undoStack: T[];
    redoStack: T[];
  }>({
    current: initialValue,
    undoStack: [],
    redoStack: [],
  });

  // Set new value and push current to undo stack
  const set = useCallback((value: T) => {
    setState((prev) => ({
      current: value,
      undoStack: [...prev.undoStack.slice(-(maxHistory - 1)), prev.current],
      redoStack: [], // Clear redo stack on new action
    }));
  }, [maxHistory]);

  // Undo last action
  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.undoStack.length === 0) return prev;

      const newUndoStack = [...prev.undoStack];
      const prevState = newUndoStack.pop()!;

      return {
        current: prevState,
        undoStack: newUndoStack,
        redoStack: [...prev.redoStack, prev.current],
      };
    });
  }, []);

  // Redo last undone action
  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.redoStack.length === 0) return prev;

      const newRedoStack = [...prev.redoStack];
      const nextState = newRedoStack.pop()!;

      return {
        current: nextState,
        undoStack: [...prev.undoStack, prev.current],
        redoStack: newRedoStack,
      };
    });
  }, []);

  // Reset to a new value and clear history
  const reset = useCallback((value: T) => {
    setState({
      current: value,
      undoStack: [],
      redoStack: [],
    });
  }, []);

  return {
    current: state.current,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    set,
    undo,
    redo,
    reset,
  };
}

// Keyboard shortcut hook for undo/redo
export function useUndoRedoKeyboard(
  undo: () => void,
  redo: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl+Z (undo) or Cmd/Ctrl+Shift+Z (redo)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Also support Cmd/Ctrl+Y for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, enabled]);
}
