import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLTFDragonModel {
  public group: THREE.Group;
  public modelScene: THREE.Group | null = null;
  public mouthMarker: THREE.Object3D;
  public isLoaded = false;
  private wingMeshes: THREE.Mesh[] = [];
  private initialPositions: Float32Array[] = [];

  constructor(onLoadCallback?: () => void) {
    this.group = new THREE.Group();
    
    // Mouth marker for fire particle ignition
    this.mouthMarker = new THREE.Object3D();
    this.mouthMarker.position.set(0, 0.4, 0.9);
    this.group.add(this.mouthMarker);

    const loader = new GLTFLoader();
    loader.load(
      '/models/dragon.glb',
      (gltf) => {
        this.modelScene = gltf.scene;
        
        // Compute bounding box and center model
        const box = new THREE.Box3().setFromObject(this.modelScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredScale = 1.6 / maxDim; // Normalize to compact ~1.6 Three.js world units
        this.modelScene.scale.setScalar(desiredScale);
        this.modelScene.position.sub(center.multiplyScalar(desiredScale));

        // Apply realistic PBR materials and shadow properties
        const scaleMaterial = new THREE.MeshStandardMaterial({
          color: 0x6e1b2c,       // Deep obsidian crimson scale
          roughness: 0.35,
          metalness: 0.5,
          flatShading: false,
        });

        const wingMaterial = new THREE.MeshStandardMaterial({
          color: 0x8a2034,       // Translucent wing ruby
          roughness: 0.4,
          metalness: 0.2,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });

        this.modelScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.name.toLowerCase().includes('wing')) {
              mesh.material = wingMaterial;
            } else {
              mesh.material = scaleMaterial;
            }

            // Save initial vertex positions for procedural wing flap deformation
            if (mesh.geometry && mesh.geometry.attributes.position) {
              this.wingMeshes.push(mesh);
              this.initialPositions.push(mesh.geometry.attributes.position.array.slice() as Float32Array);
            }
          }
        });

        this.group.add(this.modelScene);
        this.isLoaded = true;
        if (onLoadCallback) onLoadCallback();
      },
      undefined,
      (error) => {
        console.error('Failed to load GLTF Dragon model:', error);
      }
    );
  }

  // Procedural Wing Flap & Body Animation Solver
  public animate(wingTime: number, bankRoll: number): void {
    if (!this.modelScene) return;

    // Wing flap geometry vertex deformation / wing wave
    const flap = Math.sin(wingTime) * 0.25;

    this.wingMeshes.forEach((mesh, index) => {
      const origArray = this.initialPositions[index];
      const posAttr = mesh.geometry.attributes.position;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < array.length; i += 3) {
        const x = origArray[i];
        const y = origArray[i + 1];
        const z = origArray[i + 2];

        // Apply wing flap wave displacement based on distance from center X
        const distFromCenter = Math.abs(x);
        if (distFromCenter > 0.3) {
          array[i + 1] = y + Math.sin(wingTime + distFromCenter * 0.5) * 0.18 * distFromCenter;
        } else {
          array[i + 1] = y;
        }
      }

      posAttr.needsUpdate = true;
    });

    // Body roll & pitch response
    this.modelScene.rotation.z = bankRoll * 0.3;
    this.modelScene.rotation.x = Math.sin(wingTime * 2.0) * 0.05;
  }

  public getMouthWorldPosition(target: THREE.Vector3): THREE.Vector3 {
    return this.mouthMarker.getWorldPosition(target);
  }

  public getMouthDirection(target: THREE.Vector3): THREE.Vector3 {
    return this.mouthMarker.getWorldDirection(target).negate();
  }
}
