import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MeadowsPhoneModal } from '../src/components/game/meadows/MeadowsPhoneModal';
import { audio } from '../src/services/audio';

// Configure act environment flag for React 18 in jsdom
// @ts-expect-error global IS_REACT_ACT_ENVIRONMENT
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('MeadowsPhoneModal (Phase 3 GTA-Style Call)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders phone modal when open with contacts app and Call button', async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(MeadowsPhoneModal, {
          isOpen: true,
          onCallFinished: () => {},
        })
      );
    });

    const overlay = container.querySelector('[data-testid="meadows-phone-overlay"]');
    expect(overlay).not.toBeNull();
    expect(container.textContent).toContain('Municipal Waste Collection');
    expect(container.textContent).toContain('CALL GARBAGE TRUCK');

    act(() => {
      root.unmount();
    });
  });

  it('does not render when isOpen is false', async () => {
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(MeadowsPhoneModal, {
          isOpen: false,
          onCallFinished: () => {},
        })
      );
    });

    const overlay = container.querySelector('[data-testid="meadows-phone-overlay"]');
    expect(overlay).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('triggers phone ringing animation and voice dialogue on call tap', async () => {
    vi.useFakeTimers();
    const playPhoneBeepSpy = vi.spyOn(audio, 'playPhoneBeep').mockImplementation(() => {});
    const playPhoneRingSpy = vi.spyOn(audio, 'playPhoneRing').mockImplementation(() => {});
    const speakSpy = vi.spyOn(audio, 'speak').mockImplementation(() => {});
    const onCallFinished = vi.fn();

    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(MeadowsPhoneModal, {
          isOpen: true,
          onCallFinished,
        })
      );
    });

    const callBtn = container.querySelector('[data-testid="call-garbage-truck-btn"]') as HTMLButtonElement;
    expect(callBtn).not.toBeNull();

    await act(async () => {
      callBtn.click();
    });

    expect(playPhoneBeepSpy).toHaveBeenCalled();
    expect(playPhoneRingSpy).toHaveBeenCalled();
    expect(container.textContent).toContain('Calling...');

    // Advance 3.6s for ringing cycles -> connects dispatcher dialogue
    await act(async () => {
      vi.advanceTimersByTime(3600);
    });

    expect(speakSpy).toHaveBeenCalledWith('Municipal waste control. How can I help?');
    expect(container.textContent).toContain('Municipal waste control. How can I help?');

    // Advance 4.2s for player dialogue
    await act(async () => {
      vi.advanceTimersByTime(4200);
    });

    expect(speakSpy).toHaveBeenCalledWith(
      'There is a large waste pile at Green Meadows Residency. Please send a truck.'
    );
    expect(container.textContent).toContain(
      'There is a large waste pile at Green Meadows Residency. Please send a truck.'
    );

    // Advance 5.6s for dispatcher instruction response
    await act(async () => {
      vi.advanceTimersByTime(5600);
    });

    expect(speakSpy).toHaveBeenCalledWith(
      'Understood. A truck is on its way. Please sort the waste into the right bins before we arrive.'
    );
    expect(container.textContent).toContain(
      'Understood. A truck is on its way. Please sort the waste into the right bins before we arrive.'
    );

    // Advance 7.0s for call completion and hangup
    await act(async () => {
      vi.advanceTimersByTime(7000);
    });

    expect(onCallFinished).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    vi.useRealTimers();
  });
});
