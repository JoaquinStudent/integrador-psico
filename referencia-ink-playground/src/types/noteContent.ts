// NoteContent container

import type { Element } from './elements';

export interface NoteElements {
  elements: Element[];
  version?: number;
  metadata?: NoteMetadata;
}

export interface NoteMetadata {
  createdAt?: number; // Unix timestamp in milliseconds
  modifiedAt?: number;
  title?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

// Serialization helpers
export function serializeNoteElements(noteElements: NoteElements): string {
  return JSON.stringify(noteElements, null, 2);
}

export function deserializeNoteElements(json: string): NoteElements {
  const parsed = JSON.parse(json);

  // Validate basic structure
  if (!parsed.elements || !Array.isArray(parsed.elements)) {
    throw new Error('Invalid NoteElements: missing elements array');
  }

  // Validate each element has required fields
  for (const element of parsed.elements) {
    if (!element.type || !element.id) {
      throw new Error('Invalid element: missing type or id');
    }
  }

  return parsed as NoteElements;
}

// Create empty note
export function createEmptyNote(): NoteElements {
  return {
    elements: [],
    version: 1,
    metadata: {
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
  };
}

// Update note metadata
export function touchNote(note: NoteElements): NoteElements {
  return {
    ...note,
    metadata: {
      ...note.metadata,
      modifiedAt: Date.now(),
    },
  };
}
