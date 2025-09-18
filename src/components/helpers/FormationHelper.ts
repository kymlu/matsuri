export function getPixel(gridSize: number, gridX: number, margin?: number): number {
  return (gridX + (margin ?? 0)) * gridSize;
}