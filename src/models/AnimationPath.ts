export interface AnimationPath {
  fromSectionId: string,
  toSectionId: string,
  participantPaths: Record<string, Path>,
  propPaths: Record<string, Path>,
  placeholderPaths: Record<string, Path>,
}

export interface Path {
  path: string,
  fromAngle?: number,
  toAngle?: number
}