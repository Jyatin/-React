import React, { useRef, useEffect, useCallback } from 'react';
import { PhysicsWorld, PendulumState } from '../physics/PhysicsWorld';
import { useAppStore } from '../store/useAppStore';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig';
import type { RopeStyle } from '../../shared/types/rope';
import type { CharmDefinition } from '../../shared/types/charm';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

export const PhysicsScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<PhysicsWorld | null>(null);
  const stateRef = useRef<PendulumState | null>(null);
  const interactionRef = useRef<'idle' | 'hover' | 'grabbed' | 'dragging'>('idle');
  const charmImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentCharm = useAppStore(s => s.currentCharm);
  const currentRope = useAppStore(s => s.currentRope);
  const settings = useAppStore(s => s.settings);
  const openContextMenu = useAppStore(s => s.openContextMenu);

  // Load charm image if it has one
  useEffect(() => {
    if (currentCharm.imagePath) {
      const img = new Image();
      img.src = currentCharm.imagePath;
      img.onload = () => {
        charmImageRef.current = img;
      };
      img.onerror = () => {
        charmImageRef.current = null;
      };
    } else {
      charmImageRef.current = null;
    }
  }, [currentCharm.imagePath]);

  // Initialize physics
  useEffect(() => {
    const physics = new PhysicsWorld(CANVAS_WIDTH, CANVAS_HEIGHT, settings.rope.length);

    physics.setGravity(settings.physics.gravity);
    physics.setDamping(settings.physics.damping);

    physics.setOnUpdate((state) => {
      stateRef.current = state;
    });

    physics.start();
    physicsRef.current = physics;

    return () => {
      physics.destroy();
      physicsRef.current = null;
    };
  }, []); // Only init once

  // Sync settings changes to physics
  useEffect(() => {
    const physics = physicsRef.current;
    if (!physics) return;
    physics.setRopeLength(settings.rope.length);
    physics.setGravity(settings.physics.gravity);
    physics.setDamping(settings.physics.damping);
  }, [settings.rope.length, settings.physics.gravity, settings.physics.damping]);

  // Sync pause state
  useEffect(() => {
    physicsRef.current?.setPaused(settings.behavior.pausePhysics);
  }, [settings.behavior.pausePhysics]);

  // Rendering loop (separate from physics)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const state = stateRef.current;
      if (!state) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw rope
      drawRope(ctx, state, currentRope);

      // Draw anchor dot
      ctx.beginPath();
      ctx.arc(state.anchorX, state.anchorY, 3, 0, Math.PI * 2);
      ctx.fillStyle = currentRope.color;
      ctx.fill();

      // Draw charm
      drawCharm(ctx, state, currentCharm, charmImageRef.current, settings.charm.size, interactionRef.current);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentCharm, currentRope, settings.charm.size]);

  // Mouse handlers
  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return; // right-click handled separately
    const pos = getCanvasPos(e);
    const physics = physicsRef.current;
    if (!physics) return;

    if (physics.isPointOnCharm(pos.x, pos.y, settings.charm.size / 2 + 10)) {
      interactionRef.current = 'grabbed';
      physics.grab(pos.x, pos.y);
    }
  }, [getCanvasPos, settings.charm.size]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    const physics = physicsRef.current;
    if (!physics) return;

    if (interactionRef.current === 'grabbed' || interactionRef.current === 'dragging') {
      interactionRef.current = 'dragging';
      physics.drag(pos.x, pos.y);
    } else {
      // Hover detection
      const onCharm = physics.isPointOnCharm(pos.x, pos.y, settings.charm.size / 2 + 10);
      interactionRef.current = onCharm ? 'hover' : 'idle';
    }
  }, [getCanvasPos, settings.charm.size]);

  const handleMouseUp = useCallback(() => {
    if (interactionRef.current === 'grabbed' || interactionRef.current === 'dragging') {
      interactionRef.current = 'idle';
      physicsRef.current?.release();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (interactionRef.current === 'grabbed' || interactionRef.current === 'dragging') {
      physicsRef.current?.release();
    }
    interactionRef.current = 'idle';
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const physics = physicsRef.current;
    if (!physics) return;
    const pos = getCanvasPos(e);
    if (physics.isPointOnCharm(pos.x, pos.y, settings.charm.size / 2 + 15)) {
      openContextMenu(e.clientX, e.clientY);
    }
  }, [getCanvasPos, settings.charm.size, openContextMenu]);

  const cursor = interactionRef.current === 'dragging' ? 'grabbing'
    : interactionRef.current === 'hover' || interactionRef.current === 'grabbed' ? 'grab'
    : 'default';

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        cursor,
        background: 'transparent',
        display: 'block',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    />
  );
};

function drawRope(
  ctx: CanvasRenderingContext2D,
  state: PendulumState,
  rope: RopeStyle,
): void {
  const { anchorX, anchorY, charmX, charmY } = state;

  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);

  // Catenary-like curve for natural rope appearance
  const midX = (anchorX + charmX) / 2;
  const midY = (anchorY + charmY) / 2;
  const sag = Math.abs(charmX - anchorX) * 0.08;

  ctx.quadraticCurveTo(midX, midY + sag, charmX, charmY);

  ctx.strokeStyle = rope.color;
  ctx.lineWidth = rope.width;
  ctx.globalAlpha = rope.opacity;

  if (rope.dashPattern) {
    ctx.setLineDash(rope.dashPattern);
  } else {
    ctx.setLineDash([]);
  }

  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function drawCharm(
  ctx: CanvasRenderingContext2D,
  state: PendulumState,
  charm: CharmDefinition,
  image: HTMLImageElement | null,
  size: number,
  interaction: string,
): void {
  const { charmX, charmY, charmAngle } = state;

  ctx.save();
  ctx.translate(charmX, charmY);

  // Subtle rotation from physics
  ctx.rotate(charmAngle * 0.3);

  // Hover/grab scale effect
  let scale = charm.scale;
  if (interaction === 'hover') scale *= 1.08;
  if (interaction === 'grabbed' || interaction === 'dragging') scale *= 1.05;

  const halfSize = (size * scale) / 2;

  if (image) {
    // Custom image charm
    ctx.drawImage(image, -halfSize, -halfSize, halfSize * 2, halfSize * 2);
  } else {
    // Emoji charm with background circle
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Background circle
    ctx.beginPath();
    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
    ctx.fillStyle = charm.color;
    ctx.fill();

    // Reset shadow for emoji
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Emoji
    const fontSize = size * scale * 0.65;
    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charm.emoji, 0, 1);
  }

  ctx.restore();
}
