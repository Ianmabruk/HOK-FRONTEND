export const KITCHEN_FINISH_OPTIONS = {
  counterColor: [
    { value: 'classic-ivory', label: 'Classic Ivory', hex: '#E8E0D4' },
    { value: 'espresso-stone', label: 'Espresso Stone', hex: '#5B463C' },
    { value: 'graphite-vein', label: 'Graphite Vein', hex: '#4B4F54' },
  ],
  wallColor: [
    { value: 'warm-cream', label: 'Warm Cream', hex: '#F4EBDD' },
    { value: 'soft-sand', label: 'Soft Sand', hex: '#D9C3A6' },
    { value: 'olive-mist', label: 'Olive Mist', hex: '#B6BEA4' },
  ],
  floorColor: [
    { value: 'walnut-plank', label: 'Walnut Plank', hex: '#8A6248' },
    { value: 'smoked-oak', label: 'Smoked Oak', hex: '#6B5644' },
    { value: 'stone-beige', label: 'Stone Beige', hex: '#BFA78E' },
  ],
}

export const DEFAULT_KITCHEN_FINISHES = {
  counterColor: KITCHEN_FINISH_OPTIONS.counterColor[0].value,
  wallColor: KITCHEN_FINISH_OPTIONS.wallColor[0].value,
  floorColor: KITCHEN_FINISH_OPTIONS.floorColor[0].value,
}

export function findFinishOption(group, value) {
  return KITCHEN_FINISH_OPTIONS[group]?.find((option) => option.value === value)
}

export function formatFinishSelections(selections = {}) {
  return [
    ['Counter', findFinishOption('counterColor', selections.counterColor)?.label],
    ['Wall', findFinishOption('wallColor', selections.wallColor)?.label],
    ['Floor', findFinishOption('floorColor', selections.floorColor)?.label],
  ].filter(([, label]) => Boolean(label))
}
