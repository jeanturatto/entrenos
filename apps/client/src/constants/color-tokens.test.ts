import { describe, expect, it } from 'vitest';

import { palette } from './color-tokens';

const minimumTextContrast = 4.5;

function luminance(hex: string) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  const [lighter = 0, darker = 0] = values;

  return (lighter + 0.05) / (darker + 0.05);
}

describe.each(Object.entries(palette))('contraste do tema %s', (themeName, colors) => {
  const semanticTextColors = [
    ['texto', colors.text],
    ['texto secundário', colors.textMuted],
    ['marca', colors.brand],
    ['destaque', colors.accent],
    ['sucesso', colors.success],
    ['atenção', colors.warning],
    ['erro', colors.error],
    ['informação', colors.info],
  ] as const;

  it.each(semanticTextColors)('%s permanece legível sobre o fundo', (_label, foreground) => {
    expect(contrastRatio(foreground, colors.background)).toBeGreaterThanOrEqual(
      minimumTextContrast,
    );
  });

  it('mantém o botão primário legível', () => {
    expect(contrastRatio(colors.onBrand, colors.brandStrong)).toBeGreaterThanOrEqual(
      minimumTextContrast,
    );
  });

  it('mantém o botão destrutivo legível', () => {
    const foreground = themeName === 'dark' ? colors.background : '#ffffff';
    expect(contrastRatio(foreground, colors.error)).toBeGreaterThanOrEqual(minimumTextContrast);
  });
});
