// Disambiguation module exports
// Handles disambiguation when multiple element types are viable candidates

export type {
  DisambiguationCandidate,
  DisambiguationIntent,
  DisambiguationAction,
} from './DisambiguationIntent';

export {
  DISAMBIGUATION_THRESHOLD,
  MIN_CANDIDATE_CONFIDENCE,
  computeAnchorPoint,
  getStrokesBounds,
  createDisambiguationIntent,
  needsDisambiguation,
  getShapeLabel,
} from './DisambiguationIntent';

export { DisambiguationMenu } from './DisambiguationMenu';
