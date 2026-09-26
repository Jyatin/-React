import * as THREE from 'three';

export interface DragonPose {
  wingFlapAngle: number;     // Shoulder roll angle
  wingFoldAngle: number;     // Elbow bend angle
  tailAngles: number[];      // Joint angles for tail segments
  neckAngles: { pitch: number; yaw: number }[]; // Joint angles for neck
  jawOpen: number;           // 0 (closed) to 1 (fully open for fire)
  eyeGlowIntensity: number;  // Emissive eye glow
}

export class DragonModel {
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
  public eyeMaterials: THREE.MeshStandardMaterial[] = [];
  public scaleMaterial: THREE.MeshStandardMaterial;
  public wingMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    // Create realistic PBR materials
    this.scaleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a1829,       // Warm obsidian crimson
      roughness: 0.3,
      metalness: 0.5,
      bumpScale: 0.08,
      flatShading: false,
    });

    const scaleAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xb32438,       // Dragon belly bright crimson scale
      roughness: 0.4,
      metalness: 0.3,
    });

    this.wingMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c0f1e,       // Wing membrane dark ruby
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    const hornMaterial = new THREE.MeshStandardMaterial({
      color: 0x111115,       // Charcoal horn
      roughness: 0.2,
      metalness: 0.6,
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff7700,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    this.eyeMaterials.push(eyeMat);

    // -------------------------------------------------------------
    // 1. TORSO / CHEST
    // -------------------------------------------------------------
    const chestGeo = new THREE.CylinderGeometry(0.7, 0.4, 2.2, 12);
    chestGeo.rotateX(Math.PI / 2);
    const chestMesh = new THREE.Mesh(chestGeo, this.scaleMaterial);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    this.bodyGroup.add(chestMesh);

    // Belly plate
    const bellyGeo = new THREE.CylinderGeometry(0.55, 0.35, 2.0, 10);
    bellyGeo.rotateX(Math.PI / 2);
    bellyGeo.scale(0.9, 0.7, 1.0);
    const bellyMesh = new THREE.Mesh(bellyGeo, scaleAccentMaterial);
    bellyMesh.position.set(0, -0.2, 0);
    this.bodyGroup.add(bellyMesh);

    // Spine ridge spikes along back
    for (let i = -0.8; i <= 0.8; i += 0.3) {
      const spikeGeo = new THREE.ConeGeometry(0.08, 0.35, 4);
      spikeGeo.rotateX(Math.PI / 4);
      const spike = new THREE.Mesh(spikeGeo, hornMaterial);
      spike.position.set(0, 0.6, i);
      this.bodyGroup.add(spike);
    }

    // -------------------------------------------------------------
    // 2. NECK & HEAD
    // -------------------------------------------------------------
    let parentNode: THREE.Group = this.bodyGroup;
    let neckZ = -1.0;

    for (let i = 0; i < 4; i++) {
      const neckJoint = new THREE.Group();
      neckJoint.position.set(0, 0.25, neckZ);
      parentNode.add(neckJoint);
      this.neckSegments.push(neckJoint);

      const radius = 0.45 - i * 0.06;
      const neckGeo = new THREE.CylinderGeometry(radius * 0.85, radius, 0.5, 10);
      neckGeo.rotateX(Math.PI / 2);
      const neckMesh = new THREE.Mesh(neckGeo, this.scaleMaterial);
      neckMesh.castShadow = true;
      neckJoint.add(neckMesh);

      // Spine spike on neck
      const neckSpike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), hornMaterial);
      neckSpike.position.set(0, radius + 0.1, 0);
      neckJoint.add(neckSpike);

      parentNode = neckJoint;
      neckZ = -0.45;
    }

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.1, -0.45);
    parentNode.add(this.headGroup);

    // Dragon Skull Top
    const skullGeo = new THREE.ConeGeometry(0.4, 1.1, 8);
    skullGeo.rotateX(-Math.PI / 2);
    const skullMesh = new THREE.Mesh(skullGeo, this.scaleMaterial);
    skullMesh.position.set(0, 0.1, -0.3);
    skullMesh.castShadow = true;
    this.headGroup.add(skullMesh);

    // Horns (Left & Right)
    const hornGeo = new THREE.ConeGeometry(0.1, 0.9, 5);
    hornGeo.rotateX(-Math.PI / 3);

    const leftHorn = new THREE.Mesh(hornGeo, hornMaterial);
    leftHorn.position.set(0.25, 0.45, 0.1);
    leftHorn.rotation.z = -0.3;
    this.headGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, hornMaterial);
    rightHorn.position.set(-0.25, 0.45, 0.1);
    rightHorn.rotation.z = 0.3;
    this.headGroup.add(rightHorn);

    // Dragon Eyes (Glowing Orange/Fire)
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.22, 0.2, -0.35);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.22, 0.2, -0.35);
    this.headGroup.add(rightEye);

    // Hinged Lower Jaw
    this.jawGroup = new THREE.Group();
    this.jawGroup.position.set(0, -0.15, -0.1);
    this.headGroup.add(this.jawGroup);

    const jawGeo = new THREE.ConeGeometry(0.32, 0.9, 6);
    jawGeo.rotateX(-Math.PI / 2);
    jawGeo.scale(1, 0.6, 1);
    const jawMesh = new THREE.Mesh(jawGeo, scaleAccentMaterial);
    jawMesh.position.set(0, 0, -0.35);
    this.jawGroup.add(jawMesh);

    // Mouth Marker (for fire stream spawn location)
    this.mouthMarker = new THREE.Object3D();
    this.mouthMarker.position.set(0, -0.05, -0.85);
    this.headGroup.add(this.mouthMarker);

    // -------------------------------------------------------------
    // 3. WINGS (LEFT & RIGHT)
    // -------------------------------------------------------------
    this.leftWingShoulder = this.createWing(1);  // +X side
    this.rightWingShoulder = this.createWing(-1); // -X side

    this.leftWingShoulder.position.set(0.5, 0.3, -0.4);
    this.rightWingShoulder.position.set(-0.5, 0.3, -0.4);

    this.bodyGroup.add(this.leftWingShoulder);
    this.bodyGroup.add(this.rightWingShoulder);

    // -------------------------------------------------------------
    // 4. TAIL (ARTICULATED)
    // -------------------------------------------------------------
    let tailParent: THREE.Group = this.bodyGroup;
    let tailZ = 1.0;

    for (let i = 0; i < 6; i++) {
      const tailJoint = new THREE.Group();
      tailJoint.position.set(0, 0, tailZ);
      tailParent.add(tailJoint);
      this.tailSegments.push(tailJoint);

      const radius = 0.35 - i * 0.05;
      const tailGeo = new THREE.CylinderGeometry(radius * 0.8, radius, 0.6, 8);
      tailGeo.rotateX(Math.PI / 2);
      const tailMesh = new THREE.Mesh(tailGeo, this.scaleMaterial);
      tailMesh.castShadow = true;
      tailJoint.add(tailMesh);

      // Tail blade / fin at tip
      if (i === 5) {
        const finGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
        finGeo.rotateX(Math.PI / 2);
        finGeo.scale(0.15, 1, 1);
        const finMesh = new THREE.Mesh(finGeo, hornMaterial);
        finMesh.position.set(0, 0.2, 0.4);
        tailJoint.add(finMesh);
      }

      tailParent = tailJoint;
      tailZ = 0.55;
    }

    // -------------------------------------------------------------
    // 5. LEGS (Tucked in flight)
    // -------------------------------------------------------------
    const legGeo = new THREE.CylinderGeometry(0.18, 0.1, 0.8, 6);
    legGeo.rotateX(Math.PI / 4);

    const leftLeg = new THREE.Mesh(legGeo, this.scaleMaterial);
    leftLeg.position.set(0.4, -0.4, 0.4);
    leftLeg.rotation.z = -0.2;
    this.bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.scaleMaterial);
    rightLeg.position.set(-0.4, -0.4, 0.4);
    rightLeg.rotation.z = 0.2;
    this.bodyGroup.add(rightLeg);
  }

  private createWing(side: number): THREE.Group {
    const shoulder = new THREE.Group();

    // Arm Bone (Shoulder to Elbow)
    const armGeo = new THREE.CylinderGeometry(0.14, 0.1, 1.8, 8);
    armGeo.rotateZ((side * Math.PI) / 3);
    const armMesh = new THREE.Mesh(armGeo, this.scaleMaterial);
    armMesh.position.set(side * 0.75, 0.4, 0);
    shoulder.add(armMesh);

    // Elbow Joint
    const elbow = new THREE.Group();
    elbow.position.set(side * 1.5, 0.8, 0);
    shoulder.add(elbow);

    if (side === 1) this.leftWingElbow = elbow;
    else this.rightWingElbow = elbow;

    // Wing Finger Bones & Web Membrane
    const fingerGeo = new THREE.CylinderGeometry(0.08, 0.04, 2.4, 6);
    fingerGeo.rotateZ((side * Math.PI) / 6);

    const mainFinger = new THREE.Mesh(fingerGeo, this.scaleMaterial);
    mainFinger.position.set(side * 0.9, -0.4, 0.4);
    elbow.add(mainFinger);

    // Wing Membrane Shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(side * 1.6, 0.8);
    shape.lineTo(side * 3.2, -0.6);
    shape.lineTo(side * 2.2, -1.8);
    shape.lineTo(side * 1.0, -1.4);
    shape.lineTo(0, -0.6);
    shape.closePath();

    const membraneGeo = new THREE.ShapeGeometry(shape);
    const membraneMesh = new THREE.Mesh(membraneGeo, this.wingMaterial);
    membraneMesh.position.set(0, 0, 0);
    membraneMesh.castShadow = true;
    membraneMesh.receiveShadow = true;
    shoulder.add(membraneMesh);

    return shoulder;
  }

  // -------------------------------------------------------------
  // ANIMATION SOLVER API
  // -------------------------------------------------------------
  public updatePose(pose: DragonPose): void {
    // Wing Flap (Shoulder Z & Roll)
    this.leftWingShoulder.rotation.z = pose.wingFlapAngle;
    this.rightWingShoulder.rotation.z = -pose.wingFlapAngle;

    this.leftWingShoulder.rotation.x = Math.sin(pose.wingFlapAngle) * 0.3;
    this.rightWingShoulder.rotation.x = Math.sin(pose.wingFlapAngle) * 0.3;

    // Wing Elbow Bend
    if (this.leftWingElbow && this.rightWingElbow) {
      this.leftWingElbow.rotation.z = -pose.wingFoldAngle * 0.6;
      this.rightWingElbow.rotation.z = pose.wingFoldAngle * 0.6;
    }

    // Jaw Open (Hinged rotation)
    this.jawGroup.rotation.x = pose.jawOpen * 0.55;

    // Eye Glow Intensity
    this.eyeMaterials.forEach((mat) => {
      mat.emissiveIntensity = pose.eyeGlowIntensity;
    });

    // Neck Curve
    pose.neckAngles.forEach((angle, i) => {
      if (this.neckSegments[i]) {
        this.neckSegments[i].rotation.x = angle.pitch;
        this.neckSegments[i].rotation.y = angle.yaw;
      }
    });

    // Tail Sway
    pose.tailAngles.forEach((angle, i) => {
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
