import fs from 'fs';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';

export type ImagesConfig = Record<
  string,
  {
    src: string;
    alt: string;
    blur: null | string;
    href?: string;
    height?: number;
    width?: number;
  }
>;

export async function getImageBlurs<T extends ImagesConfig>(
  basePath: string,
  imagesConfig: T,
) {
  const awaitedEntries = await Promise.all([
    ...Object.entries(imagesConfig).map(async ([key, imageConfig]) => {
      const src = imageConfig['src'];
      const buffer = fs.readFileSync(path.join(basePath, src));
      const { base64 } = await getPlaiceholder(buffer);

      imagesConfig[key].blur = base64;

      return [key, imageConfig];
    }),
  ]);

  return imagesConfig as {
    [key in keyof T]: Omit<T[key], 'blur'> & { blur: string };
  };
}
