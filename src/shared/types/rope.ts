export interface RopeStyle {
  id: string;
  name: string;
  color: string;
  width: number;
  dashPattern?: number[];
  opacity: number;
}

export const BUILT_IN_ROPES: RopeStyle[] = [
  { id: 'black', name: 'Black Cord', color: '#1a1a1a', width: 2, opacity: 1 },
  { id: 'white', name: 'White Cord', color: '#e5e5e5', width: 2, opacity: 0.9 },
  { id: 'red', name: 'Red Cord', color: '#ef4444', width: 2, opacity: 1 },
  { id: 'gold', name: 'Gold Cord', color: '#d97706', width: 2, opacity: 1 },
  { id: 'dotted', name: 'Dotted Cord', color: '#71717a', width: 2, dashPattern: [4, 4], opacity: 0.8 },
];
