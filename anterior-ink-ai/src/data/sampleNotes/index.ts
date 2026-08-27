import simpleStrokes from './simpleStrokes.json';
import tictactoe from './tictactoe.json';
import mixed from './mixed.json';
import type { NoteElements } from '../../types';

export const sampleNotes: Record<string, NoteElements> = {
  simpleStrokes: simpleStrokes as NoteElements,
  tictactoe: tictactoe as NoteElements,
  mixed: mixed as NoteElements,
};

export { simpleStrokes, tictactoe, mixed };
