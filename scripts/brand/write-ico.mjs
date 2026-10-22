/**
 * Minimal ICO writer: an ICONDIR, one ICONDIRENTRY per image, then the PNG payloads as they are
 * (PNG-in-ICO, supported by every browser and by Windows Vista+). No dependencies.
 */
export function buildIco(pngs) {
  const dims = pngs.map((png) => {
    if (png.subarray(1, 4).toString() !== 'PNG') throw new Error('ICO entry is not a PNG');
    return { w: png.readUInt32BE(16), h: png.readUInt32BE(20) };
  });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((png, i) => {
    const o = i * 16;
    dir.writeUInt8(dims[i].w >= 256 ? 0 : dims[i].w, o); // width (0 = 256)
    dir.writeUInt8(dims[i].h >= 256 ? 0 : dims[i].h, o + 1);
    dir.writeUInt8(0, o + 2); // palette colours
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...pngs]);
}

/** @returns {{w:number,h:number,bytes:number}[]} what an ICO contains (for verification) */
export function readIcoDirectory(ico) {
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) throw new Error('not an ICO');
  const n = ico.readUInt16LE(4);
  return Array.from({ length: n }, (_, i) => {
    const o = 6 + i * 16;
    return { w: ico.readUInt8(o) || 256, h: ico.readUInt8(o + 1) || 256, bytes: ico.readUInt32LE(o + 8), offset: ico.readUInt32LE(o + 12) };
  });
}
