export const PHYSICS_CONFIG = {
  /** Gravity multiplier (1.0 = Earth-like) */
  gravity: 1.0,
  /** Gravity Y component applied to the engine */
  gravityY: 0.8,
  /** Angular damping on the charm body (0–1, higher = more damping) */
  angularDamping: 0.05,
  /** Linear damping on the charm body */
  linearDamping: 0.02,
  /** Air friction applied to the charm */
  airFriction: 0.02,
  /** Default rope length in pixels */
  ropeLength: 120,
  /** Rope constraint stiffness (0–1) */
  ropeStiffness: 0.9,
  /** Charm body mass */
  charmMass: 1.0,
  /** How strongly the mouse pulls the charm */
  interactionStrength: 0.08,
  /** Maximum velocity cap to prevent instability */
  maxVelocity: 15,
  /** Charm body radius for physics (pixels) */
  charmRadius: 20,
  /** Anchor position from top of canvas */
  anchorY: 5,
  /** Number of rope segments for visual rendering */
  ropeSegments: 8,
  /** Physics timestep */
  timeStep: 1000 / 60,
  /** Constraint damping */
  constraintDamping: 0.3,
} as const;

export type PhysicsConfig = typeof PHYSICS_CONFIG;
