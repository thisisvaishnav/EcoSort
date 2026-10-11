import React from 'react';

export type NarrativeHighlight = 'waste' | 'life';

export interface NarrativeToken {
  text: string;
  highlight?: NarrativeHighlight;
}

export interface NarrativeBannerProps {
  tokens: NarrativeToken[];
}

const HIGHLIGHT_CLASS: Record<NarrativeHighlight, string> = {
  waste: 'text-orange-400',
  life: 'text-emerald-400',
};

/**
 * NarrativeBanner — centred translucent strip with highlighted keywords.
 * Tokens avoid regex-in-JSX and keep the copy easy to check for STE rules.
 */
export const NarrativeBanner: React.FC<NarrativeBannerProps> = ({ tokens }) => (
  <div
    className="hud-glass rounded-2xl px-4 py-2 max-w-[46vw] sm:max-w-md text-center"
    data-testid="narrative-banner"
  >
    <p className="text-[11px] sm:text-xs font-fun font-bold text-white/90 leading-snug">
      {tokens.map((token, i) =>
        token.highlight ? (
          <span key={i} className={HIGHLIGHT_CLASS[token.highlight]}>{token.text}</span>
        ) : (
          <span key={i}>{token.text}</span>
        )
      )}
    </p>
  </div>
);
