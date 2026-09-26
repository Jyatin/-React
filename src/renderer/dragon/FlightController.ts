import * as THREE from 'three';
import { RealisticDragonModel } from './RealisticDragonModel';

export enum FlightState {
  CRUISE = 'CRUISE',
  PREPARE_FIRE = 'PREPARE_FIRE',
  BREATHE_FIRE = 'BREATHE_FIRE',
  COOLDOWN = 'COOLDOWN',
  RECOVER = 'RECOVER',
}

export class FlightController {
  public dragon: RealisticDragonModel;
  public state: FlightState = FlightState.CRUISE;
  
  // 3D Spatial Transforms
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
  public orientation: THREE.Quaternion = new THREE.Quaternion();

  // Pathing & Speed
  private curve: THREE.CatmullRomCurve3 | null = null;
  private curveProgress = 0;
  private targetSpeed = 2.5;
  private currentSpeed = 2.5;

  // Timers
  private stateTimer = 0;
  private fireCooldownTimer = 5 + Math.random() * 7;

  // Animation state
  private wingTime = 0;
  private lastYaw = 0;
  private currentBankRoll = 0;

  // Flight Volume Bounds
  private bounds = {
    minX: -6.5,
    maxX: 6.5,
    minY: -3.5,
    maxY: 3.5,
    minZ: -2.0,
    maxZ: 2.0,
  };

  constructor(dragon: RealisticDragonModel) {
    this.dragon = dragon;
    this.generateNewFlightPath();
  }

  public setBounds(minX: number, maxX: number, minY: number, maxY: number): void {
    this.bounds.minX = minX;
    this.bounds.maxX = maxX;
    this.bounds.minY = minY;
    this.bounds.maxY = maxY;
    this.generateNewFlightPath();
  }

  private generateNewFlightPath(): void {
    const points: THREE.Vector3[] = [];
    points.push(this.position.clone());

    for (let i = 0; i < 4; i++) {
      const x = (Math.random() - 0.5) * (this.bounds.maxX - this.bounds.minX) * 0.85;
      const y = (Math.random() - 0.5) * (this.bounds.maxY - this.bounds.minY) * 0.85;
      const z = (Math.random() - 0.5) * (this.bounds.maxZ - this.bounds.minZ);
      points.push(new THREE.Vector3(x, y, z));
    }

    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    this.curveProgress = 0;
  }

  public update(delta: number): void {
    this.stateTimer += delta;
    this.fireCooldownTimer -= delta;

    // -------------------------------------------------------------
    // STATE MACHINE
    // -------------------------------------------------------------
    switch (this.state) {
      case FlightState.CRUISE:
        this.targetSpeed = 2.5;
        if (this.fireCooldownTimer <= 0) {
          this.transitionTo(FlightState.PREPARE_FIRE);
        }
        break;

      case FlightState.PREPARE_FIRE:
        this.targetSpeed = 0.9;
        if (this.stateTimer >= 1.2) {
          this.transitionTo(FlightState.BREATHE_FIRE);
        }
        break;

      case FlightState.BREATHE_FIRE:
        this.targetSpeed = 0.5;
        if (this.stateTimer >= 2.8) {
          this.transitionTo(FlightState.COOLDOWN);
        }
        break;

      case FlightState.COOLDOWN:
        this.targetSpeed = 1.4;
        if (this.stateTimer >= 1.0) {
          this.transitionTo(FlightState.RECOVER);
        }
        break;

      case FlightState.RECOVER:
        this.targetSpeed = 3.8;
        if (this.stateTimer >= 1.5) {
          this.fireCooldownTimer = 6 + Math.random() * 8;
          this.transitionTo(FlightState.CRUISE);
        }
        break;
    }

    // -------------------------------------------------------------
    // POSITION & QUATERNION BANKING
    // -------------------------------------------------------------
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.targetSpeed, delta * 3.0);

    if (this.curve) {
      const curveLength = this.curve.getLength();
      this.curveProgress += (this.currentSpeed * delta) / curveLength;

      if (this.curveProgress >= 1.0) {
        this.generateNewFlightPath();
      } else {
        const nextPos = this.curve.getPointAt(Math.min(this.curveProgress, 1.0));
        const tangent = this.curve.getTangentAt(Math.min(this.curveProgress, 1.0)).normalize();

        this.velocity.copy(tangent).multiplyScalar(this.currentSpeed);
        this.position.copy(nextPos);

        this.dragon.group.position.copy(this.position);

        const forward = tangent.clone();
        const yaw = Math.atan2(-forward.x, -forward.z);
        const pitch = Math.asin(forward.y);

        let yawDelta = yaw - this.lastYaw;
        while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
        while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
        this.lastYaw = yaw;

        const targetRoll = THREE.MathUtils.clamp(-yawDelta * 16.0, -0.7, 0.7);
        this.currentBankRoll = THREE.MathUtils.lerp(this.currentBankRoll, targetRoll, delta * 5.0);

        const euler = new THREE.Euler(pitch, yaw, this.currentBankRoll, 'YXZ');
        const targetQuad = new THREE.Quaternion().setFromEuler(euler);

        this.orientation.slerp(targetQuad, delta * 6.0);
        this.dragon.group.quaternion.copy(this.orientation);
      }
    }

    // -------------------------------------------------------------
    // ANIMATION & JAW / THROAT LIGHT SOLVER
    // -------------------------------------------------------------
    const flapFreq = this.state === FlightState.RECOVER ? 7.5 : this.currentSpeed * 1.8;
    this.wingTime += delta * flapFreq;

    const wingFlapAngle = Math.sin(this.wingTime) * 0.7;
    const wingFoldAngle = Math.max(0, Math.cos(this.wingTime)) * 0.45;

    // Body bobbing
    this.dragon.bodyGroup.position.y = Math.sin(this.wingTime * 2.0) * 0.12;

    // Tail secondary sway
    const tailAngles: number[] = [];
    for (let i = 0; i < 7; i++) {
      const delay = i * 0.35;
      const sway = Math.sin(this.wingTime - delay) * (0.15 + i * 0.05) - this.currentBankRoll * 0.3;
      tailAngles.push(sway);
    }

    // Jaw open & throat light intensity
    let jawOpen = 0.0;
    let throatLight = 0.0;

    if (this.state === FlightState.PREPARE_FIRE) {
      jawOpen = (this.stateTimer / 1.2) * 0.6;
      throatLight = (this.stateTimer / 1.2) * 12.0;
    } else if (this.state === FlightState.BREATHE_FIRE) {
      jawOpen = 0.95; // Jaw opens fully like Drogon reference
      throatLight = 22.0 + Math.sin(performance.now() * 0.03) * 6.0 + Math.random() * 4.0; // Pulsing fire light
    } else if (this.state === FlightState.COOLDOWN) {
      jawOpen = Math.max(0, 0.95 - (this.stateTimer / 1.0) * 0.95);
      throatLight = Math.max(0, 22.0 - (this.stateTimer / 1.0) * 22.0);
    }

    this.dragon.updatePose(wingFlapAngle, wingFoldAngle, jawOpen, tailAngles, throatLight);
  }

  public triggerFireManually(): void {
    if (this.state === FlightState.CRUISE) {
      this.fireCooldownTimer = 0;
    }
  }

  private transitionTo(newState: FlightState): void {
    this.state = newState;
    this.stateTimer = 0;
  }
}
