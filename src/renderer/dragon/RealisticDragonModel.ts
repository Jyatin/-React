import * as THREE from 'three';
import { createDragonScaleBumpMap, createWingMembraneTexture } from './textures/ScaleTextureGenerator';

export class RealisticDragonModel {
  public group: THREE.Group;
  public bodyGroup: THREE.Group;
  public headGroup: THREE.Group;
  public jawGroup: THREE.Group;
  public leftWingShoulder: THREE.Group;
  public leftWingElbow!: THREE.Group;
  public rightWingShoulder: THREE.Group;
  public rightWingElbow!: THREE.Group;
  public tailSegments: THREE.Group[] = [];
  public neckSegments: THREE.Group[] = [];
  public mouthMarker: THREE.Object3D;
  public throatLight: THREE.PointLight;

  public scaleMaterial: THREE.MeshStandardMaterial;
  public wingMaterial: THREE.MeshStandardMaterial;
  public hornMaterial: THREE.MeshStandardMaterial;
  public teethMaterial: THREE.MeshStandardMaterial;
  public eyeMaterials: THREE.MeshStandardMaterial[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Procedural PBR Scale Bump Maps
    const bumpMap = createDragonScaleBumpMap();
    const wingTex = createWingMembraneTexture();

    // 1. Dragon Scale Material (Dark obsidian crimson hide with bump details)
    this.scaleMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b0d16,
      bumpMap: bumpMap,
      bumpScale: 0.08,
      roughness: 0.35,
      metalness: 0.45,
    });

    const scaleAccentMat = new THREE.MeshStandardMaterial({
      color: 0x6e1b2b,
      bumpMap: bumpMap,
      bumpScale: 0.06,
      roughness: 0.4,
      metalness: 0.3,
    });

    // 2. Wing Membrane Material
    this.wingMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a0b18,
      map: wingTex,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });

    // 3. Horn & Crest Material
    this.hornMaterial = new THREE.MeshStandardMaterial({
      color: 0x18141a,
      roughness: 0.25,
      metalness: 0.5,
    });

    // 4. Teeth Material
    this.teethMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0dd,
      roughness: 0.2,
      metalness: 0.1,
    });

    // 5. Glowing Fiery Eyes
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff3300,
      emissive: 0xff6600,
      emissiveIntensity: 3.0,
      roughness: 0.1,
    });
    this.eyeMaterials.push(eyeMat);

    // -------------------------------------------------------------
    // TORSO & CHEST
    // -------------------------------------------------------------
    const chestGeo = new THREE.CylinderGeometry(0.75, 0.45, 2.4, 14);
    chestGeo.rotateX(Math.PI / 2);
    const chestMesh = new THREE.Mesh(chestGeo, this.scaleMaterial);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    this.bodyGroup.add(chestMesh);

    // Belly plates
    const bellyGeo = new THREE.CylinderGeometry(0.6, 0.38, 2.2, 12);
    bellyGeo.rotateX(Math.PI / 2);
    bellyGeo.scale(0.9, 0.7, 1.0);
    const bellyMesh = new THREE.Mesh(bellyGeo, scaleAccentMat);
    bellyMesh.position.set(0, -0.25, 0);
    this.bodyGroup.add(bellyMesh);

    // Spine crest spikes
    for (let i = -0.9; i <= 0.9; i += 0.25) {
      const spikeGeo = new THREE.ConeGeometry(0.09, 0.4, 5);
      spikeGeo.rotateX(Math.PI / 4);
      const spike = new THREE.Mesh(spikeGeo, this.hornMaterial);
      spike.position.set(0, 0.65, i);
      this.bodyGroup.add(spike);
    }

    // -------------------------------------------------------------
    // NECK & DETAILED SKULL
    // -------------------------------------------------------------
    let parentNode: THREE.Group = this.bodyGroup;
    let neckZ = -1.1;

    for (let i = 0; i < 4; i++) {
      const neckJoint = new THREE.Group();
      neckJoint.position.set(0, 0.25, neckZ);
      parentNode.add(neckJoint);
      this.neckSegments.push(neckJoint);

      const radius = 0.48 - i * 0.06;
      const neckGeo = new THREE.CylinderGeometry(radius * 0.85, radius, 0.55, 12);
      neckGeo.rotateX(Math.PI / 2);
      const neckMesh = new THREE.Mesh(neckGeo, this.scaleMaterial);
      neckMesh.castShadow = true;
      neckJoint.add(neckMesh);

      // Spiky neck crests along sides & top (like Drogon reference)
      const crestLeft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), this.hornMaterial);
      crestLeft.position.set(radius + 0.05, 0, 0);
      crestLeft.rotation.z = -Math.PI / 3;
      neckJoint.add(crestLeft);

      const crestRight = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), this.hornMaterial);
      crestRight.position.set(-radius - 0.05, 0, 0);
      crestRight.rotation.z = Math.PI / 3;
      neckJoint.add(crestRight);

      parentNode = neckJoint;
      neckZ = -0.5;
    }

    // Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.12, -0.5);
    parentNode.add(this.headGroup);

    // Dragon Skull Snout
    const skullGeo = new THREE.ConeGeometry(0.42, 1.25, 10);
    skullGeo.rotateX(-Math.PI / 2);
    const skullMesh = new THREE.Mesh(skullGeo, this.scaleMaterial);
    skullMesh.position.set(0, 0.1, -0.35);
    skullMesh.castShadow = true;
    this.headGroup.add(skullMesh);

    // Large Main Sweeping Horns (Left & Right)
    const hornGeo = new THREE.ConeGeometry(0.12, 1.2, 6);
    hornGeo.rotateX(-Math.PI / 3);

    const leftHorn = new THREE.Mesh(hornGeo, this.hornMaterial);
    leftHorn.position.set(0.3, 0.55, 0.15);
    leftHorn.rotation.z = -0.35;
    this.headGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, this.hornMaterial);
    rightHorn.position.set(-0.3, 0.55, 0.15);
    rightHorn.rotation.z = 0.35;
    this.headGroup.add(rightHorn);

    // Crown Spikes
    for (let a = -0.3; a <= 0.3; a += 0.2) {
      const crownSpike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 4), this.hornMaterial);
      crownSpike.position.set(a, 0.45, 0.2);
      crownSpike.rotation.x = -0.4;
      this.headGroup.add(crownSpike);
    }

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.24, 0.22, -0.4);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.24, 0.22, -0.4);
    this.headGroup.add(rightEye);

    // Upper Teeth Row
    for (let t = -0.22; t <= 0.22; t += 0.08) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 4), this.teethMaterial);
      tooth.position.set(t, -0.08, -0.75 - Math.abs(t) * 0.5);
      tooth.rotation.x = Math.PI;
      this.headGroup.add(tooth);
    }

    // Hinged Lower Jaw
    this.jawGroup = new THREE.Group();
    this.jawGroup.position.set(0, -0.18, -0.12);
    this.headGroup.add(this.jawGroup);

    const jawGeo = new THREE.ConeGeometry(0.36, 1.1, 8);
    jawGeo.rotateX(-Math.PI / 2);
    jawGeo.scale(1, 0.55, 1);
    const jawMesh = new THREE.Mesh(jawGeo, scaleAccentMat);
    jawMesh.position.set(0, 0, -0.4);
    this.jawGroup.add(jawMesh);

    // Lower Teeth Row
    for (let t = -0.2; t <= 0.2; t += 0.08) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 4), this.teethMaterial);
      tooth.position.set(t, 0.1, -0.7 - Math.abs(t) * 0.5);
      this.jawGroup.add(tooth);
    }

    // Dragon Tongue
    const tongueGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.7, 6);
    tongueGeo.rotateX(-Math.PI / 2);
    const tongueMesh = new THREE.Mesh(tongueGeo, new THREE.MeshStandardMaterial({ color: 0x991f2d, roughness: 0.5 }));
    tongueMesh.position.set(0, 0.02, -0.35);
    this.jawGroup.add(tongueMesh);

    // Mouth Marker & Inner Throat Dynamic Light (Illuminates throat, teeth, scales)
    this.mouthMarker = new THREE.Object3D();
    this.mouthMarker.position.set(0, -0.05, -0.9);
    this.headGroup.add(this.mouthMarker);

    this.throatLight = new THREE.PointLight(0xff6600, 0, 8, 1.8);
    this.mouthMarker.add(this.throatLight);

    // -------------------------------------------------------------
    // WINGS (LEFT & RIGHT)
    // -------------------------------------------------------------
    this.leftWingShoulder = this.createWing(1);
    this.rightWingShoulder = this.createWing(-1);

    this.leftWingShoulder.position.set(0.55, 0.35, -0.45);
    this.rightWingShoulder.position.set(-0.55, 0.35, -0.45);

    this.bodyGroup.add(this.leftWingShoulder);
    this.bodyGroup.add(this.rightWingShoulder);

    // -------------------------------------------------------------
    // ARTICULATED TAIL
    // -------------------------------------------------------------
    let tailParent: THREE.Group = this.bodyGroup;
    let tailZ = 1.1;

    for (let i = 0; i < 7; i++) {
      const tailJoint = new THREE.Group();
      tailJoint.position.set(0, 0, tailZ);
      tailParent.add(tailJoint);
      this.tailSegments.push(tailJoint);

      const radius = 0.38 - i * 0.05;
      const tailGeo = new THREE.CylinderGeometry(radius * 0.8, radius, 0.6, 10);
      tailGeo.rotateX(Math.PI / 2);
      const tailMesh = new THREE.Mesh(tailGeo, this.scaleMaterial);
      tailMesh.castShadow = true;
      tailJoint.add(tailMesh);

      // Spine spike along tail
      const tailSpike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 4), this.hornMaterial);
      tailSpike.position.set(0, radius + 0.1, 0);
      tailJoint.add(tailSpike);

      tailParent = tailJoint;
      tailZ = 0.55;
    }
  }

  private createWing(side: number): THREE.Group {
    const shoulder = new THREE.Group();

    // Arm Bone
    const armGeo = new THREE.CylinderGeometry(0.15, 0.11, 2.0, 8);
    armGeo.rotateZ((side * Math.PI) / 3);
    const armMesh = new THREE.Mesh(armGeo, this.scaleMaterial);
    armMesh.position.set(side * 0.85, 0.45, 0);
    shoulder.add(armMesh);

    // Elbow Joint
    const elbow = new THREE.Group();
    elbow.position.set(side * 1.7, 0.9, 0);
    shoulder.add(elbow);

    if (side === 1) this.leftWingElbow = elbow;
    else this.rightWingElbow = elbow;

    // Wing Strut Finger Bones
    const fingerGeo = new THREE.CylinderGeometry(0.09, 0.04, 2.8, 6);
    fingerGeo.rotateZ((side * Math.PI) / 6);
    const mainFinger = new THREE.Mesh(fingerGeo, this.scaleMaterial);
    mainFinger.position.set(side * 1.0, -0.5, 0.5);
    elbow.add(mainFinger);

    // Wing Membrane Shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side * 1.8, 0.9);
    shape.lineTo(side * 3.6, -0.7);
    shape.lineTo(side * 2.5, -2.0);
    shape.lineTo(side * 1.1, -1.6);
    shape.lineTo(0, -0.7);
    shape.closePath();

    const membraneGeo = new THREE.ShapeGeometry(shape);
    const membraneMesh = new THREE.Mesh(membraneGeo, this.wingMaterial);
    membraneMesh.castShadow = true;
    membraneMesh.receiveShadow = true;
    shoulder.add(membraneMesh);

    return shoulder;
  }

  public updatePose(wingFlapAngle: number, wingFoldAngle: number, jawOpen: number, tailAngles: number[], throatLightIntensity: number): void {
    this.leftWingShoulder.rotation.z = wingFlapAngle;
    this.rightWingShoulder.rotation.z = -wingFlapAngle;

    this.leftWingShoulder.rotation.x = Math.sin(wingFlapAngle) * 0.35;
    this.rightWingShoulder.rotation.x = Math.sin(wingFlapAngle) * 0.35;

    if (this.leftWingElbow && this.rightWingElbow) {
      this.leftWingElbow.rotation.z = -wingFoldAngle * 0.65;
      this.rightWingElbow.rotation.z = wingFoldAngle * 0.65;
    }

    // Jaw rotation for fire breathing
    this.jawGroup.rotation.x = jawOpen * 0.6;

    // Inner throat light illumination
    this.throatLight.intensity = throatLightIntensity;

    // Tail sway
    tailAngles.forEach((angle, i) => {
      if (this.tailSegments[i]) {
        this.tailSegments[i].rotation.y = angle;
        this.tailSegments[i].rotation.x = Math.sin(angle * 0.5) * 0.15;
      }
    });
  }

  public getMouthWorldPosition(target: THREE.Vector3): THREE.Vector3 {
    return this.mouthMarker.getWorldPosition(target);
  }

  public getMouthDirection(target: THREE.Vector3): THREE.Vector3 {
    return this.mouthMarker.getWorldDirection(target).negate();
  }
}
