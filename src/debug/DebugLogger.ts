// Debug logging system with observable message store

export interface DebugLogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'action';
  message: string;
  data?: unknown;
}

type LogListener = (entries: DebugLogEntry[]) => void;

const MAX_ENTRIES = 500;
let entries: DebugLogEntry[] = [];
let nextId = 1;
const listeners: Set<LogListener> = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener([...entries]);
  }
}

function addEntry(level: DebugLogEntry['level'], message: string, data?: unknown) {
  const entry: DebugLogEntry = {
    id: nextId++,
    timestamp: new Date(),
    level,
    message,
    data,
  };

  entries = [...entries, entry].slice(-MAX_ENTRIES);
  notifyListeners();

  // Also log to console in development
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  consoleMethod(`[${level.toUpperCase()}] ${message}`, data ?? '');
}

export const debugLog = {
  info(message: string, data?: unknown) {
    addEntry('info', message, data);
  },

  warn(message: string, data?: unknown) {
    addEntry('warn', message, data);
  },

  error(message: string, data?: unknown) {
    addEntry('error', message, data);
  },

  action(message: string, data?: unknown) {
    addEntry('action', message, data);
  },

  getEntries(): DebugLogEntry[] {
    return [...entries];
  },

  subscribe(listener: LogListener): () => void {
    listeners.add(listener);
    // Immediately notify with current entries
    listener([...entries]);
    return () => listeners.delete(listener);
  },

  clear() {
    entries = [];
    notifyListeners();
  },
};

// Element action logging helpers
export function logElementCreated(elementType: string, elementId: string, details?: string) {
  debugLog.action(`Created ${elementType}`, { id: elementId.slice(0, 8), details });
}

export function logElementMutated(elementType: string, elementId: string, action: string) {
  debugLog.action(`${action} ${elementType}`, { id: elementId.slice(0, 8) });
}

export function logElementDeleted(elementType: string, elementId: string) {
  debugLog.action(`Deleted ${elementType}`, { id: elementId.slice(0, 8) });
}

export function logRecognitionResult(text: string, confidence?: number) {
  debugLog.info(`Recognition: "${text}"`, { confidence: confidence?.toFixed(2) });
}

export function logInteraction(elementType: string, action: string) {
  debugLog.info(`Interaction: ${elementType} - ${action}`);
}
