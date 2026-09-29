import { useState, useCallback, useEffect } from 'react'

export interface UndoRedoState<T> {
  current: T
  canUndo: boolean
  canRedo: boolean
  set: (value: T) => void
  undo: () => void
  redo: () => void
  reset: (value: T) => void
}

export function useUndoRedo<T>(initialValue: T, maxHistory = 100): UndoRedoState<T> {
  const [state, setState] = useState<{ current: T; undoStack: T[]; redoStack: T[] }>({
    current: initialValue, undoStack: [], redoStack: [],
  })

  const set = useCallback((value: T) => {
    setState(prev => ({
      current: value,
      undoStack: [...prev.undoStack.slice(-(maxHistory - 1)), prev.current],
      redoStack: [],
    }))
  }, [maxHistory])

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev
      const stack = [...prev.undoStack]
      const val = stack.pop()!
      return { current: val, undoStack: stack, redoStack: [...prev.redoStack, prev.current] }
    })
  }, [])

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev
      const stack = [...prev.redoStack]
      const val = stack.pop()!
      return { current: val, undoStack: [...prev.undoStack, prev.current], redoStack: stack }
    })
  }, [])

  const reset = useCallback((value: T) => {
    setState({ current: value, undoStack: [], redoStack: [] })
  }, [])

  return { current: state.current, canUndo: state.undoStack.length > 0, canRedo: state.redoStack.length > 0, set, undo, redo, reset }
}

export function useUndoRedoKeyboard(undo: () => void, redo: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, enabled])
}
