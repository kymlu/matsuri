export function getPixel(gridSize: number, logicalCoordinate: number, margin?: number): number {
  return (logicalCoordinate + (margin ?? 0)) * gridSize;
}