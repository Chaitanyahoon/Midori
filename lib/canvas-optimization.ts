"use client"

/**
 * Performance optimization utilities for canvas rendering.
 * Provides helpers for efficient requestAnimationFrame-based animations.
 */

export interface AnimationState {
  isRunning: boolean
  lastFrameTime: number
  frameCount: number
  fps: number
}

/**
 * Create a managed animation loop with performance tracking.
 * Handles requestAnimationFrame cleanup and prevents multiple loops.
 */
export function createAnimationLoop(
  onFrame: (deltaTime: number, state: AnimationState) => void,
  options?: {
    targetFps?: number
    autoStart?: boolean
  },
) {
  const state: AnimationState = {
    isRunning: false,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0,
  }

  let frameId: number | null = null
  const targetFrameTime = options?.targetFps ? 1000 / options.targetFps : 16.67 // 60 FPS default

  const frame = (now: number) => {
    if (state.lastFrameTime === 0) {
      state.lastFrameTime = now
    }

    const deltaTime = now - state.lastFrameTime

    // Skip frame if we haven't reached target frame time
    if (deltaTime >= targetFrameTime) {
      state.frameCount++
      const fpsInterval = now - state.lastFrameTime

      // Update FPS every second
      if (state.frameCount % 60 === 0) {
        state.fps = Math.round(1000 / (fpsInterval / state.frameCount))
      }

      onFrame(deltaTime / 1000, state)
      state.lastFrameTime = now
    }

    if (state.isRunning) {
      frameId = requestAnimationFrame(frame)
    }
  }

  const start = () => {
    if (!state.isRunning) {
      state.isRunning = true
      state.lastFrameTime = 0
      frameId = requestAnimationFrame(frame)
    }
  }

  const stop = () => {
    state.isRunning = false
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
  }

  const reset = () => {
    stop()
    state.frameCount = 0
    state.fps = 0
    state.lastFrameTime = 0
  }

  if (options?.autoStart) {
    start()
  }

  return { state, start, stop, reset }
}

/**
 * Batch multiple drawing operations to reduce reflows.
 * Useful for complex canvas rendering.
 */
export function batchDrawOperations<T>(
  operations: Array<() => T>,
  delayMs: number = 0,
): Promise<T[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = operations.map((op) => op())
      resolve(results)
    }, delayMs)
  })
}

/**
 * Calculate viewport-aware rendering scale.
 * Helps optimize rendering for different screen sizes.
 */
export function getRenderScale(
  containerWidth: number,
  containerHeight: number,
  baseWidth: number = 1920,
  baseHeight: number = 1080,
): number {
  const widthScale = containerWidth / baseWidth
  const heightScale = containerHeight / baseHeight
  return Math.min(widthScale, heightScale)
}

/**
 * Memoize canvas drawing operations.
 * Useful for expensive draw calls that don't change frequently.
 */
export class CanvasDrawCache {
  private cache = new Map<string, ImageData>()
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas")
    this.canvas.width = width
    this.canvas.height = height
    const ctx = this.canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")
    this.ctx = ctx
  }

  /**
   * Store or retrieve a cached drawing operation.
   */
  draw(
    key: string,
    drawFn: (ctx: CanvasRenderingContext2D) => void,
    invalidate = false,
  ): ImageData {
    if (!invalidate && this.cache.has(key)) {
      return this.cache.get(key)!
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    drawFn(this.ctx)

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.cache.set(key, imageData)
    return imageData
  }

  invalidate(key: string) {
    this.cache.delete(key)
  }

  invalidateAll() {
    this.cache.clear()
  }
}
