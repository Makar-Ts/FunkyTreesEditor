export function isInsideAnyRange(range, ranges) {
  return ranges.some(c => c.containsRange(range));
}