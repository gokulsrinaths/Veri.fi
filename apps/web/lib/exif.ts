/**
 * Basic EXIF extraction from JPEG buffer.
 * Returns GPS and DateTime if present; otherwise null.
 * Graceful fallback: returns null on any error so UI can use manual location.
 */

export interface ExifResult {
  latitude?: number;
  longitude?: number;
  dateTime?: string;
}

export function extractExif(buffer: Buffer): ExifResult | null {
  try {
    if (buffer.length < 20 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
    let offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xe1) {
        const exif = readApp1Exif(buffer, offset + 4);
        if (exif) return exif;
      }
      offset += 2;
      if (offset + 2 > buffer.length) break;
      const len = buffer.readUInt16BE(offset);
      offset += 2 + (len || 2);
    }
  } catch {
    return null;
  }
  return null;
}

function readApp1Exif(buffer: Buffer, start: number): ExifResult | null {
  if (start + 8 > buffer.length) return null;
  const length = buffer.readUInt16BE(start);
  if (buffer.toString("ascii", start + 2, start + 8) !== "Exif\0\0") return null;
  const tiff = start + 8;
  if (tiff + 8 > buffer.length) return null;
  const littleEndian = buffer.readUInt16LE(tiff) === 0x4949;
  const readU32 = (o: number) =>
    littleEndian ? buffer.readUInt32LE(o) : buffer.readUInt32BE(o);
  const ifd0Offset = readU32(tiff + 4);
  const ifd0 = tiff + ifd0Offset;
  if (ifd0 + 2 > buffer.length) return null;
  const numEntries = littleEndian
    ? buffer.readUInt16LE(ifd0)
    : buffer.readUInt16BE(ifd0);
  let lat: number | undefined;
  let lon: number | undefined;
  let dateTime: string | undefined;
  for (let i = 0; i < numEntries && ifd0 + 2 + (i + 1) * 12 <= buffer.length; i++) {
    const entryOffset = ifd0 + 2 + i * 12;
    const tag = littleEndian
      ? buffer.readUInt16LE(entryOffset)
      : buffer.readUInt16BE(entryOffset);
    const valueOffset = entryOffset + 8;
    if (tag === 0x8825) {
      const gpsOffset = readU32(valueOffset) + tiff;
      if (gpsOffset + 24 <= buffer.length) {
        const latRef = buffer.toString("ascii", gpsOffset + 6, gpsOffset + 7);
        const latOff = readU32(gpsOffset + 8) + tiff;
        const lonRef = buffer.toString("ascii", readU32(gpsOffset + 12) + tiff, readU32(gpsOffset + 12) + tiff + 1);
        const lonOff = readU32(gpsOffset + 16) + tiff;
        const latVal = readRational(buffer, latOff, littleEndian);
        const lonVal = readRational(buffer, lonOff, littleEndian);
        if (latVal != null) lat = latRef === "S" ? -latVal : latVal;
        if (lonVal != null) lon = lonRef === "W" ? -lonVal : lonVal;
      }
    } else if (tag === 0x132) {
      const off = readU32(valueOffset) + tiff;
      if (off + 19 <= buffer.length)
        dateTime = buffer.toString("ascii", off, off + 19).replace(/\0/g, "").trim();
    }
  }
  if (lat != null || lon != null || dateTime) return { latitude: lat, longitude: lon, dateTime };
  return null;
}

function readRational(buffer: Buffer, offset: number, le: boolean): number | null {
  if (offset + 8 > buffer.length) return null;
  const num = le ? buffer.readInt32LE(offset) : buffer.readInt32BE(offset);
  const den = le ? buffer.readInt32LE(offset + 4) : buffer.readInt32BE(offset + 4);
  return den === 0 ? null : num / den;
}
