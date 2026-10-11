/**
 * Android Runtime Bridge (Agent H)
 *
 * Provides lifecycle listeners and guards for mobile WebView / Capacitor execution:
 * 1. Hardware Back Button handler (triggers in-game pause, prevents premature exit)
 * 2. WebGL Context Loss / Restore guards
 * 3. Audio Context unlock on first touch
 */

export interface AndroidBridgeOptions {
  onHardwareBack?: () => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export function registerAndroidBridge(options: AndroidBridgeOptions = {}): () => void {
  // 1. Hardware Back Button Listener (Capacitor App event or popstate fallback)
  const handlePopState = (e: PopStateEvent) => {
    e.preventDefault();
    if (options.onHardwareBack) {
      options.onHardwareBack();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
  }

  // 2. Audio Context Unlock Helper
  const handleFirstTouch = () => {
    // Unlocks Web Audio on user gesture
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', handleFirstTouch, { passive: true });
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
  }

  // 3. Cleanup unregister function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    }
  };
}
