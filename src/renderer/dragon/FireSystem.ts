import * as THREE from 'three';
import { RealisticDragonModel } from './RealisticDragonModel';
import { FlightState } from './FlightController';
import { FireShader } from './shaders/FireShader';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  type: 'fire' | 'smoke' | 'ember';
}

export class FireSystem {
  public group: THREE.Group;
  private dragon: RealisticDragonModel;

  private flameConeMesh: THREE.Mesh;
  private fireShaderMaterial: THREE.ShaderMaterial;
  
  private particles: Particle[] = [];
  private fireMesh: THREE.InstancedMesh;
  private smokeMesh: THREE.InstancedMesh;
  private emberMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D = new THREE.Object3D();

  private maxFireParticles = 350;
  private maxSmokeParticles = 200;
  private maxEmberParticles = 120;

  private mouthPos = new THREE.Vector3();
  private mouthDir = new THREE.Vector3();

  constructor(dragon: RealisticDragonModel) {
    this.dragon = dragon;
    this.group = new THREE.Group();

    // 1. GLSL Shader Flame Jet Cone attached directly to mouth
    const coneGeo = new THREE.ConeGeometry(0.5, 2.8, 16, 16, true);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, -1.4);

    this.fireShaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(FireShader.uniforms),
      vertexShader: FireShader.vertexShader,
      fragmentShader: FireShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.flameConeMesh = new THREE.Mesh(coneGeo, this.fireShaderMaterial);
    this.flameConeMesh.visible = false;
    this.group.add(this.flameConeMesh);

    // 2. Instanced Fire Particles
    const fireGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.fireMesh = new THREE.InstancedMesh(fireGeo, fireMat, this.maxFireParticles);
    this.fireMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.fireMesh);

    // 3. Instanced Smoke Particles
    const smokeGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x221a24,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    this.smokeMesh = new THREE.InstancedMesh(smokeGeo, smokeMat, this.maxSmokeParticles);
    this.smokeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.smokeMesh);

    // 4. Instanced Ember Particles
    const emberGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.emberMesh = new THREE.InstancedMesh(emberGeo, emberMat, this.maxEmberParticles);
    this.emberMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.emberMesh);
  }

  public update(delta: number, flightState: FlightState): void {
    this.dragon.getMouthWorldPosition(this.mouthPos);
    this.dragon.getMouthDirection(this.mouthDir);

    // Update GLSL fire shader time uniform
    this.fireShaderMaterial.uniforms.uTime.value += delta;

    // Position GLSL flame cone at mouth
    this.flameConeMesh.position.copy(this.mouthPos);

    const targetRot = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      this.mouthDir
    );
    this.flameConeMesh.quaternion.copy(targetRot);

    // -------------------------------------------------------------
    // SPAWN PARTICLES & SHADER FLAME CONE
    // -------------------------------------------------------------
    if (flightState === FlightState.BREATHE_FIRE) {
      this.flameConeMesh.visible = true;
      const scale = 0.8 + Math.sin(performance.now() * 0.02) * 0.2;
      this.flameConeMesh.scale.set(scale, scale, scale * 1.3);

      const spawnCount = Math.floor(7 + Math.random() * 6);
      for (let i = 0; i < spawnCount; i++) {
        if (this.particles.length < this.maxFireParticles + this.maxSmokeParticles + this.maxEmberParticles) {
          const spread = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          );

          const vel = this.mouthDir.clone()
            .add(spread)
            .normalize()
            .multiplyScalar(7.5 + Math.random() * 5.0);

          this.particles.push({
            position: this.mouthPos.clone().add(spread),
            velocity: vel,
            life: 0,
            maxLife: 0.55 + Math.random() * 0.35,
            size: 0.8 + Math.random() * 1.0,
            type: 'fire',
          });

          if (Math.random() > 0.5) {
            this.particles.push({
              position: this.mouthPos.clone(),
              velocity: vel.clone().multiplyScalar(0.7).add(new THREE.Vector3(
                (Math.random() - 0.5) * 2.0,
                1.2 + Math.random() * 1.2,
                (Math.random() - 0.5) * 2.0
              )),
              life: 0,
              maxLife: 0.9 + Math.random() * 0.6,
              size: 0.7 + Math.random() * 0.5,
              type: 'ember',
            });
          }
        }
      }
    } else {
      this.flameConeMesh.visible = false;
    }

    // -------------------------------------------------------------
    // PARTICLE SIMULATION
    // -------------------------------------------------------------
    let fireIdx = 0;
    let smokeIdx = 0;
    let emberIdx = 0;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        if (p.type === 'fire' && Math.random() > 0.5) {
          this.particles.push({
            position: p.position.clone(),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.7,
              1.0 + Math.random() * 1.0,
              (Math.random() - 0.5) * 0.7
            ),
            life: 0,
            maxLife: 1.2 + Math.random() * 0.7,
            size: 1.4 + Math.random() * 1.2,
            type: 'smoke',
          });
        }
        this.particles.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, delta);

      if (p.type === 'fire') {
        p.velocity.multiplyScalar(0.95);
        p.size += delta * 2.2;

        if (fireIdx < this.maxFireParticles) {
          this.dummy.position.copy(p.position);
          const lifeProgress = p.life / p.maxLife;
          const scale = p.size * (1 - lifeProgress * 0.35);
          this.dummy.scale.set(scale, scale, scale);
          this.dummy.updateMatrix();

          this.fireMesh.setMatrixAt(fireIdx, this.dummy.matrix);
          fireIdx++;
        }
      } else if (p.type === 'smoke') {
        p.velocity.y += delta * 0.4;
        p.size += delta * 2.4;

        if (smokeIdx < this.maxSmokeParticles) {
          this.dummy.position.copy(p.position);
          this.dummy.scale.setScalar(p.size);
          this.dummy.updateMatrix();

          this.smokeMesh.setMatrixAt(smokeIdx, this.dummy.matrix);
          smokeIdx++;
        }
      } else if (p.type === 'ember') {
        p.velocity.y += delta * 0.35;

        if (emberIdx < this.maxEmberParticles) {
          this.dummy.position.copy(p.position);
          this.dummy.scale.setScalar(p.size * (1 - p.life / p.maxLife));
          this.dummy.updateMatrix();

          this.emberMesh.setMatrixAt(emberIdx, this.dummy.matrix);
          emberIdx++;
        }
      }
    }

    // Hide unused instances
    for (let i = fireIdx; i < this.maxFireParticles; i++) {
      this.dummy.position.set(9999, 9999, 9999);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.fireMesh.setMatrixAt(i, this.dummy.matrix);
    }

    for (let i = smokeIdx; i < this.maxSmokeParticles; i++) {
      this.dummy.position.set(9999, 9999, 9999);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.smokeMesh.setMatrixAt(i, this.dummy.matrix);
    }

    for (let i = emberIdx; i < this.maxEmberParticles; i++) {
      this.dummy.position.set(9999, 9999, 9999);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.emberMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.fireMesh.instanceMatrix.needsUpdate = true;
    this.smokeMesh.instanceMatrix.needsUpdate = true;
    this.emberMesh.instanceMatrix.needsUpdate = true;
  }
}
