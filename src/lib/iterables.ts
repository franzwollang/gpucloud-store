export function isIterable(obj: any): obj is Iterable<any> {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
