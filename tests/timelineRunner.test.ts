import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimelineRunner, TimelineStep } from '../src/systems/timelineRunner';

describe('TimelineRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs all actions in sequence', async () => {
    const runner = new TimelineRunner<{ log: string[] }>();
    const context = { log: [] };

    const steps: TimelineStep<typeof context>[] = [
      {
        action: (ctx) => {
          ctx.log.push('step1');
        },
        duration: 2,
      },
      {
        action: (ctx) => {
          ctx.log.push('step2');
        },
        duration: 1,
      },
      {
        action: (ctx) => {
          ctx.log.push('step3');
        },
      },
    ];

    const runPromise = runner.run(steps, context);

    expect(context.log).toEqual(['step1']);

    await vi.advanceTimersByTimeAsync(2000);
    expect(context.log).toEqual(['step1', 'step2']);

    await vi.advanceTimersByTimeAsync(1000);
    expect(context.log).toEqual(['step1', 'step2', 'step3']);

    const result = await runPromise;
    expect(result).toBe(true);
    expect(runner.isRunning).toBe(false);
  });

  it('can be cancelled midway without firing remaining steps', async () => {
    const runner = new TimelineRunner<{ log: string[] }>();
    const context = { log: [] };

    const steps: TimelineStep<typeof context>[] = [
      {
        action: (ctx) => {
          ctx.log.push('step1');
        },
        duration: 5,
      },
      {
        action: (ctx) => {
          ctx.log.push('step2');
        },
      },
    ];

    const runPromise = runner.run(steps, context);
    expect(runner.isRunning).toBe(true);
    expect(context.log).toEqual(['step1']);

    await vi.advanceTimersByTimeAsync(2000);
    runner.cancel();

    await vi.advanceTimersByTimeAsync(5000);
    const result = await runPromise;

    expect(result).toBe(false);
    expect(context.log).toEqual(['step1']);
    expect(runner.isRunning).toBe(false);
  });
});
