import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './PhysicsConfig';

export interface PendulumState {
  anchorX: number;
  anchorY: number;
  charmX: number;
  charmY: number;
  charmAngle: number;
  velocity: { x: number; y: number };
  isGrabbed: boolean;
}

export class PhysicsWorld {
  private engine: Matter.Engine;
  private runner: Matter.Runner | null = null;
  private anchor: Matter.Body;
  private charm: Matter.Body;
  private constraint: Matter.Constraint;
  private mouseConstraint: Matter.Constraint | null = null;
  private isGrabbed = false;
  private canvasWidth: number;
  private canvasHeight: number;
  private ropeLength: number;
  private onUpdate: ((state: PendulumState) => void) | null = null;
  private rafId: number | null = null;
  private lastTime = 0;
  private paused = false;

  constructor(canvasWidth: number, canvasHeight: number, ropeLength?: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.ropeLength = ropeLength ?? PHYSICS_CONFIG.ropeLength;

    // Create engine with gravity
    this.engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: PHYSICS_CONFIG.gravityY * PHYSICS_CONFIG.gravity,
        scale: 0.001,
      },
    });

    const anchorX = canvasWidth / 2;
    const anchorY = PHYSICS_CONFIG.anchorY;

    // Fixed anchor point at top
    this.anchor = Matter.Bodies.circle(anchorX, anchorY, 3, {
      isStatic: true,
      render: { visible: false },
    });

    // Charm body
    this.charm = Matter.Bodies.circle(
      anchorX,
      anchorY + this.ropeLength,
      PHYSICS_CONFIG.charmRadius,
      {
        mass: PHYSICS_CONFIG.charmMass,
        frictionAir: PHYSICS_CONFIG.airFriction,
        restitution: 0.2,
        render: { visible: false },
      }
    );

    // Rope constraint
    this.constraint = Matter.Constraint.create({
      bodyA: this.anchor,
      bodyB: this.charm,
      length: this.ropeLength,
      stiffness: PHYSICS_CONFIG.ropeStiffness,
      damping: PHYSICS_CONFIG.constraintDamping,
      render: { visible: false },
    });

    Matter.Composite.add(this.engine.world, [this.anchor, this.charm, this.constraint]);
  }

  setOnUpdate(callback: (state: PendulumState) => void): void {
    this.onUpdate = callback;
  }

  start(): void {
    this.lastTime = performance.now();
    this.tick();
  }

  private tick = (): void => {
    if (this.paused) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const now = performance.now();
    const delta = Math.min(now - this.lastTime, 32); // cap at ~30fps min
    this.lastTime = now;

    Matter.Engine.update(this.engine, delta);

    // Velocity capping to prevent instability
    const vel = this.charm.velocity;
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (speed > PHYSICS_CONFIG.maxVelocity) {
      const scale = PHYSICS_CONFIG.maxVelocity / speed;
      Matter.Body.setVelocity(this.charm, {
        x: vel.x * scale,
        y: vel.y * scale,
      });
    }

    if (this.onUpdate) {
      this.onUpdate({
        anchorX: this.anchor.position.x,
        anchorY: this.anchor.position.y,
        charmX: this.charm.position.x,
        charmY: this.charm.position.y,
        charmAngle: this.charm.angle,
        velocity: this.charm.velocity,
        isGrabbed: this.isGrabbed,
      });
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  grab(mouseX: number, mouseY: number): void {
    this.isGrabbed = true;

    // Create mouse constraint to follow cursor
    if (this.mouseConstraint) {
      Matter.Composite.remove(this.engine.world, this.mouseConstraint);
    }

    this.mouseConstraint = Matter.Constraint.create({
      pointA: { x: mouseX, y: mouseY },
      bodyB: this.charm,
      stiffness: PHYSICS_CONFIG.interactionStrength,
      damping: 0.1,
      length: 0,
      render: { visible: false },
    });

    Matter.Composite.add(this.engine.world, this.mouseConstraint);
  }

  drag(mouseX: number, mouseY: number): void {
    if (this.mouseConstraint) {
      this.mouseConstraint.pointA = { x: mouseX, y: mouseY };
    }
  }

  release(): void {
    this.isGrabbed = false;

    if (this.mouseConstraint) {
      Matter.Composite.remove(this.engine.world, this.mouseConstraint);
      this.mouseConstraint = null;
    }
  }

  isPointOnCharm(x: number, y: number, hitRadius?: number): boolean {
    const dx = x - this.charm.position.x;
    const dy = y - this.charm.position.y;
    const r = hitRadius ?? PHYSICS_CONFIG.charmRadius + 10;
    return dx * dx + dy * dy < r * r;
  }

  setRopeLength(length: number): void {
    this.ropeLength = length;
    this.constraint.length = length;
  }

  setGravity(multiplier: number): void {
    this.engine.gravity.y = PHYSICS_CONFIG.gravityY * multiplier;
  }

  setDamping(damping: number): void {
    this.charm.frictionAir = damping;
  }

  setCharmMass(mass: number): void {
    Matter.Body.setMass(this.charm, mass);
  }

  setAnchorX(x: number): void {
    Matter.Body.setPosition(this.anchor, { x, y: this.anchor.position.y });
  }

  getCharmPosition(): { x: number; y: number } {
    return { ...this.charm.position };
  }

  getAnchorPosition(): { x: number; y: number } {
    return { ...this.anchor.position };
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    // Re-center anchor
    this.setAnchorX(width / 2);
  }

  destroy(): void {
    this.stop();
    Matter.Engine.clear(this.engine);
    Matter.Composite.clear(this.engine.world, false);
    this.onUpdate = null;
  }
}
