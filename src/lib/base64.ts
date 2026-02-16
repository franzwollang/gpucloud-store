/**
 * Encoding UTF8 ⇢ base64
 * @see https://stackoverflow.com/a/30106551
 */
export function b64EncodeUnicode(str: string) {
  return Buffer.from(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
    'utf8'
  ).toString('base64');
}

/**
 * Decoding base64 ⇢ UTF8
 * @see https://stackoverflow.com/a/30106551
 */
export function b64DecodeUnicode(str: string) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}
