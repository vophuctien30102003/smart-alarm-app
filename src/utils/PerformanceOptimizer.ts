import React from 'react';
import { InteractionManager } from 'react-native';

export class PerformanceOptimizer {
  private static pendingAnimations = new Set<() => void>();
  private static isAnimating = false;

  static async batchUpdates<T>(updates: (() => Promise<T>)[]): Promise<T[]> {
    const results = await Promise.all(updates.map(update => update()));
    return results;
  }

  static scheduleAfterInteractions<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(() => {
        task().then(resolve).catch(reject);
      });
    });
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay) as any;
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  static queueAnimation(animation: () => void): void {
    this.pendingAnimations.add(animation);
    this.processAnimationQueue();
  }

  private static processAnimationQueue(): void {
    if (this.isAnimating || this.pendingAnimations.size === 0) return;

    this.isAnimating = true;
    const animationsArray = Array.from(this.pendingAnimations);
    const animation = animationsArray[0];
    
    if (animation) {
      this.pendingAnimations.delete(animation);

      requestAnimationFrame(() => {
        animation();
        this.isAnimating = false;
        this.processAnimationQueue();
      });
    }
  }

  static cleanup(): void {
    this.pendingAnimations.clear();
    this.isAnimating = false;
  }

  static canPerformHeavyOperation(): boolean {
    return this.pendingAnimations.size < 5;
  }

  static createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFunc);
  }
}

export default PerformanceOptimizer;
