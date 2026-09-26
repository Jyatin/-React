export interface CharmDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  scale: number;
  mass: number;
  imagePath?: string;
  isCustom?: boolean;
}

export interface CharmInstance {
  id: string;
  definitionId: string;
  position: { x: number; y: number };
}

export const BUILT_IN_CHARMS: CharmDefinition[] = [
  { id: 'cat', name: 'Cat', emoji: '🐱', color: '#f59e0b', scale: 1, mass: 1 },
  { id: 'ghost', name: 'Ghost', emoji: '👻', color: '#a78bfa', scale: 1, mass: 0.7 },
  { id: 'planet', name: 'Planet', emoji: '🪐', color: '#3b82f6', scale: 1.1, mass: 1.5 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', color: '#92400e', scale: 0.9, mass: 1.2 },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', color: '#ef4444', scale: 0.9, mass: 0.8 },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: '#6b7280', scale: 1, mass: 1.3 },
];
