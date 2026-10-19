export const DEFAULT_DESIGNATIONS = [
  'Principal',
  'Dean R&D',
  'Dean Academics',
] as const

export type DefaultDesignation = (typeof DEFAULT_DESIGNATIONS)[number]
