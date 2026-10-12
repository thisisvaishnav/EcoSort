/**
 * Timeline Runner per clean-architecture-guard Rule: Cutscenes and timing
 * Declarative, abortable, cancellable, skippable timeline sequence executor.
 */

export interface TimelineStep<TContext = unknown> {
  id?: string;
  duration?: number; // duration in seconds
  action?: (context: TContext, signal: AbortSignal) => void | Promise<void>;
  skipAction?: (context: TContext) => void;
}

export interface TimelineRunnerOptions {
  signal?: AbortSignal;
}

export class TimelineRunner<TContext = unknown> {
  private abortController: AbortController | null = null;
  private isRunningState: boolean = false;

  get isRunning(): boolean {
    return this.isRunningState;
  }

  /**
   * Run a sequence of steps in order.
   * Can be aborted via cancel() or passed AbortSignal.
   */
  async run(
    steps: TimelineStep<TContext>[],
    context: TContext,
    options?: TimelineRunnerOptions
  ): Promise<boolean> {
    this.cancel();
    this.abortController = new AbortController();
    this.isRunningState = true;

    const parentSignal = options?.signal;
    const internalSignal = this.abortController.signal;

    const handleParentAbort = () => this.cancel();
    if (parentSignal) {
      if (parentSignal.aborted) {
        this.isRunningState = false;
        return false;
      }
      parentSignal.addEventListener('abort', handleParentAbort, { once: true });
    }

    try {
      for (const step of steps) {
        if (internalSignal.aborted || (parentSignal && parentSignal.aborted)) {
          this.isRunningState = false;
          return false;
        }

        if (step.action) {
          await step.action(context, internalSignal);
        }

        if (internalSignal.aborted || (parentSignal && parentSignal.aborted)) {
          this.isRunningState = false;
          return false;
        }

        if (step.duration && step.duration > 0) {
          await this.delay(step.duration * 1000, internalSignal);
        }
      }

      this.isRunningState = false;
      return true;
    } catch (err: unknown) {
      this.isRunningState = false;
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false;
      }
      throw err;
    } finally {
      if (parentSignal) {
        parentSignal.removeEventListener('abort', handleParentAbort);
      }
    }
  }

  /**
   * Cancel currently running timeline sequence.
   */
  cancel(): void {
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
    }
    this.abortController = null;
    this.isRunningState = false;
  }

  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const timer = setTimeout(() => {
        signal.removeEventListener('abort', handleAbort);
        resolve();
      }, ms);

      const handleAbort = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', handleAbort);
        reject(new DOMException('Aborted', 'AbortError'));
      };

      signal.addEventListener('abort', handleAbort, { once: true });
    });
  }
}
