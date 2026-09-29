/**
 * Style presets for SketchableImage AI generation.
 *
 * Each preset provides a descriptive prompt that tells the model
 * how to render sketched strokes into a styled image.
 */

export const STYLE_PRESETS = {
  studio: 'A clean professional studio photograph with soft directional lighting, neutral background, and realistic materials.',
  toy: 'A colorful plastic toy with smooth rounded edges, bright saturated colors, and a playful cartoon aesthetic.',
  ceramic: 'A hand-crafted ceramic sculpture with visible glaze texture, matte and glossy surfaces, and warm earthy tones.',
  plush: 'A soft plush stuffed animal with fuzzy fabric texture, stitched seams, button eyes, and huggable proportions.',
  wood: 'A hand-carved wooden figure with visible wood grain, warm natural tones, and a rustic artisan finish.',
  metal: 'A polished brushed-metal sculpture with reflective chrome surfaces, sharp edges, and industrial precision.',
  stone: 'A chiseled stone sculpture with rough hewn texture, subtle grey and beige tones, and monumental weight.',
  anime: 'A vibrant anime-style illustration with bold outlines, cel shading, expressive features, and dynamic color.',
  neon: 'A glowing neon sign against a dark background, with vivid electric colors, light bloom, and glass tubing.',
  glass: 'A translucent blown-glass object with refractive caustics, smooth curves, and delicate color tinting.',
  ink: 'A traditional East Asian ink wash painting with flowing brushstrokes, tonal gradients, and minimal composition.',
} as const;

export type StylePresetKey = keyof typeof STYLE_PRESETS;

export const DEFAULT_STYLE_PRESET: StylePresetKey = 'studio';

const PROMPT_SUFFIX =
  'Transform only the sketched object in the center. No extra scene or environment. Preserve overall silhouette from the sketch. Every drawn line is the silhouette of a solid three-dimensional object — fill each one completely with the same material and texture. No thin lines, outlines, pen strokes, or sketch artifacts may remain in the final image.';

export function buildPrompt(presetKey: StylePresetKey): string {
  return `${STYLE_PRESETS[presetKey]} ${PROMPT_SUFFIX}`;
}

const ITERATIVE_SUFFIX =
  'Refine the second image using the sketch in the first image as a shape guide. Preserve the style and details of the second image while adjusting its shape to match the first sketch. Every drawn line represents the silhouette of a solid three-dimensional object — fill each one completely with the same material, texture, and style as the existing object. No thin lines, outlines, pen strokes, or sketch artifacts may remain anywhere in the final image.';

export function buildIterativePrompt(presetKey: StylePresetKey): string {
  return `${STYLE_PRESETS[presetKey]} ${ITERATIVE_SUFFIX}`;
}
