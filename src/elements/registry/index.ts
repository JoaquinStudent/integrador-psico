// Element Registry exports
export type {
  ElementPlugin,
  CreationContext,
  CreationResult,
  InteractionResult,
  RenderOptions,
  HandleDescriptor,
  HandleAppearance,
  HandleDragPhase,
  HandleInfo, // Legacy, deprecated
} from './ElementPlugin';

export {
  registerPlugin,
  getPlugin,
  getPlugins,
  renderElement,
  getElementBounds,
  tryCreateElement,
  tryCreateElementWithDisambiguation,
  tryInteraction,
  getStrokesBoundingBox,
  // New unified handle API
  findHandleAtPoint,
  dispatchHandleDrag,
  getElementHandles,
  getAllHandles,
} from './ElementRegistry';

export type { HandleHitResult } from './ElementRegistry';
