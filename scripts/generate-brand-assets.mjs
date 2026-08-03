import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import pngjs from 'pngjs';

const { PNG } = pngjs;
const outputDirectory = resolve('apps/client/assets/images');

const colors = {
  brand: [93, 79, 124],
  brandStrong: [71, 58, 101],
  brandLight: [118, 101, 151],
  cream: [248, 245, 240],
  white: [255, 255, 255],
};

function clamp(value, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function mix(from, to, amount) {
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
}

function ringCoverage(x, y, centerX, centerY, angle, radiusX, radiusY, thickness) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const translatedX = x - centerX;
  const translatedY = y - centerY;
  const rotatedX = translatedX * cosine + translatedY * sine;
  const rotatedY = -translatedX * sine + translatedY * cosine;
  const normalizedRadius = Math.sqrt(
    (rotatedX * rotatedX) / (radiusX * radiusX) + (rotatedY * rotatedY) / (radiusY * radiusY),
  );
  const distance = Math.abs(normalizedRadius - 1) * Math.min(radiusX, radiusY);
  return clamp((thickness / 2 + 1.25 - distance) / 2.5);
}

function renderAsset({ size, background, ringColor, padding = 0 }) {
  const image = new PNG({ width: size, height: size });
  const scale = 1 - padding * 2;
  const radiusX = size * 0.19 * scale;
  const radiusY = size * 0.26 * scale;
  const thickness = size * 0.052 * scale;
  const leftX = size * 0.43;
  const rightX = size * 0.57;
  const centerY = size * 0.5;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      let base = [0, 0, 0];
      let baseAlpha = 0;

      if (background) {
        const vertical = y / Math.max(size - 1, 1);
        const horizontal = x / Math.max(size - 1, 1);
        base = mix(background.from, background.to, clamp(vertical * 0.7 + horizontal * 0.3));
        baseAlpha = 255;
      }

      const leftRing = ringCoverage(
        x,
        y,
        leftX,
        centerY,
        -Math.PI / 12,
        radiusX,
        radiusY,
        thickness,
      );
      const rightRing = ringCoverage(
        x,
        y,
        rightX,
        centerY,
        Math.PI / 12,
        radiusX,
        radiusY,
        thickness,
      );
      const coverage = Math.max(leftRing, rightRing);

      image.data[offset] = Math.round(base[0] * (1 - coverage) + ringColor[0] * coverage);
      image.data[offset + 1] = Math.round(base[1] * (1 - coverage) + ringColor[1] * coverage);
      image.data[offset + 2] = Math.round(base[2] * (1 - coverage) + ringColor[2] * coverage);
      image.data[offset + 3] = Math.round(baseAlpha + (255 - baseAlpha) * coverage);
    }
  }

  return PNG.sync.write(image, { colorType: 6 });
}

const assets = [
  {
    file: 'icon.png',
    size: 1024,
    background: { from: colors.brandStrong, to: colors.brandLight },
    ringColor: colors.cream,
  },
  {
    file: 'android-icon-foreground.png',
    size: 1024,
    background: null,
    ringColor: colors.cream,
    padding: 0.12,
  },
  {
    file: 'android-icon-monochrome.png',
    size: 1024,
    background: null,
    ringColor: colors.white,
    padding: 0.12,
  },
  {
    file: 'splash-icon.png',
    size: 1024,
    background: null,
    ringColor: colors.brand,
    padding: 0.06,
  },
  {
    file: 'favicon.png',
    size: 128,
    background: { from: colors.brandStrong, to: colors.brandLight },
    ringColor: colors.cream,
  },
];

for (const asset of assets) {
  const outputPath = resolve(outputDirectory, asset.file);
  writeFileSync(outputPath, renderAsset(asset));
  console.log(`Generated ${outputPath}`);
}
