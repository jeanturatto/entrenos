import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import pngjs from 'pngjs';

const { PNG } = pngjs;
const outputDirectory = resolve('apps/client/assets/images');
const emblemPath = resolve(outputDirectory, 'brand-emblem.png');
const lockupPath = resolve(outputDirectory, 'brand-lockup.png');

const colors = {
  transparent: [0, 0, 0, 0],
  cream: [243, 238, 231, 255],
  white: [255, 255, 255, 255],
};

function createCanvas(width, height, color) {
  const image = new PNG({ width, height });

  for (let offset = 0; offset < image.data.length; offset += 4) {
    image.data[offset] = color[0];
    image.data[offset + 1] = color[1];
    image.data[offset + 2] = color[2];
    image.data[offset + 3] = color[3];
  }

  return image;
}

function cropToVisiblePixels(image, alphaThreshold = 4) {
  let minimumX = image.width;
  let minimumY = image.height;
  let maximumX = -1;
  let maximumY = -1;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.data[(y * image.width + x) * 4 + 3];

      if (alpha > alphaThreshold) {
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);
      }
    }
  }

  if (maximumX < minimumX || maximumY < minimumY) {
    throw new Error('The source image does not contain visible pixels.');
  }

  const width = maximumX - minimumX + 1;
  const height = maximumY - minimumY + 1;
  const cropped = new PNG({ width, height });
  PNG.bitblt(image, cropped, minimumX, minimumY, width, height, 0, 0);
  return cropped;
}

function resizeBilinear(source, width, height) {
  const resized = new PNG({ width, height });
  const scaleX = source.width / width;
  const scaleY = source.height / height;

  for (let y = 0; y < height; y += 1) {
    const sourceY = (y + 0.5) * scaleY - 0.5;
    const y0 = Math.max(0, Math.floor(sourceY));
    const y1 = Math.min(source.height - 1, y0 + 1);
    const weightY = Math.max(0, sourceY - y0);

    for (let x = 0; x < width; x += 1) {
      const sourceX = (x + 0.5) * scaleX - 0.5;
      const x0 = Math.max(0, Math.floor(sourceX));
      const x1 = Math.min(source.width - 1, x0 + 1);
      const weightX = Math.max(0, sourceX - x0);
      const samples = [
        [x0, y0, (1 - weightX) * (1 - weightY)],
        [x1, y0, weightX * (1 - weightY)],
        [x0, y1, (1 - weightX) * weightY],
        [x1, y1, weightX * weightY],
      ];
      let alpha = 0;
      const premultiplied = [0, 0, 0];

      for (const [sampleX, sampleY, weight] of samples) {
        const sourceOffset = (sampleY * source.width + sampleX) * 4;
        const sampleAlpha = source.data[sourceOffset + 3] / 255;
        alpha += sampleAlpha * weight;

        for (let channel = 0; channel < 3; channel += 1) {
          premultiplied[channel] += source.data[sourceOffset + channel] * sampleAlpha * weight;
        }
      }

      const destinationOffset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        resized.data[destinationOffset + channel] =
          alpha > 0 ? Math.round(premultiplied[channel] / alpha) : 0;
      }
      resized.data[destinationOffset + 3] = Math.round(alpha * 255);
    }
  }

  return resized;
}

function recolor(image, color) {
  for (let offset = 0; offset < image.data.length; offset += 4) {
    image.data[offset] = color[0];
    image.data[offset + 1] = color[1];
    image.data[offset + 2] = color[2];
  }

  return image;
}

function composite(destination, source, originX, originY) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceOffset = (y * source.width + x) * 4;
      const destinationOffset = ((originY + y) * destination.width + originX + x) * 4;
      const sourceAlpha = source.data[sourceOffset + 3] / 255;
      const destinationAlpha = destination.data[destinationOffset + 3] / 255;
      const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);

      for (let channel = 0; channel < 3; channel += 1) {
        const sourceColor = source.data[sourceOffset + channel];
        const destinationColor = destination.data[destinationOffset + channel];
        destination.data[destinationOffset + channel] =
          outputAlpha > 0
            ? Math.round(
                (sourceColor * sourceAlpha +
                  destinationColor * destinationAlpha * (1 - sourceAlpha)) /
                  outputAlpha,
              )
            : 0;
      }

      destination.data[destinationOffset + 3] = Math.round(outputAlpha * 255);
    }
  }
}

function renderSquareAsset(source, { size, background, coverage, monochrome }) {
  const canvas = createCanvas(size, size, background);
  const targetSize = Math.round(size * coverage);
  const scale = Math.min(targetSize / source.width, targetSize / source.height);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const resized = resizeBilinear(source, width, height);

  if (monochrome) {
    recolor(resized, monochrome);
  }

  composite(canvas, resized, Math.round((size - width) / 2), Math.round((size - height) / 2));
  return canvas;
}

function normalizeLockup() {
  const source = cropToVisiblePixels(PNG.sync.read(readFileSync(lockupPath)));
  const horizontalPadding = Math.round(source.width * 0.04);
  const verticalPadding = Math.round(source.height * 0.1);
  const canvas = createCanvas(
    source.width + horizontalPadding * 2,
    source.height + verticalPadding * 2,
    colors.transparent,
  );
  composite(canvas, source, horizontalPadding, verticalPadding);
  writeFileSync(lockupPath, PNG.sync.write(canvas, { colorType: 6 }));
}

const emblem = cropToVisiblePixels(PNG.sync.read(readFileSync(emblemPath)));
const assets = [
  {
    file: 'icon.png',
    size: 1024,
    background: colors.cream,
    coverage: 0.78,
  },
  {
    file: 'android-icon-foreground.png',
    size: 1024,
    background: colors.transparent,
    coverage: 0.58,
  },
  {
    file: 'android-icon-monochrome.png',
    size: 1024,
    background: colors.transparent,
    coverage: 0.58,
    monochrome: colors.white,
  },
  {
    file: 'splash-icon.png',
    size: 1024,
    background: colors.transparent,
    coverage: 0.78,
  },
  {
    file: 'favicon.png',
    size: 128,
    background: colors.cream,
    coverage: 0.82,
  },
];

for (const asset of assets) {
  const outputPath = resolve(outputDirectory, asset.file);
  const image = renderSquareAsset(emblem, asset);
  writeFileSync(outputPath, PNG.sync.write(image, { colorType: 6 }));
  console.log(`Generated ${outputPath}`);
}

normalizeLockup();
console.log(`Normalized ${lockupPath}`);
