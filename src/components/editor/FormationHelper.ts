export function getPixel(gridSize: number, gridX: number, margin?: number): number {
  return gridX * gridSize - (margin ?? 0);
}