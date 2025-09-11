import { ParticipantPosition } from "../../models/Position.ts";

export async function getAnimationPaths(sectionIds: string[], gridSize: number, participants: Array<ParticipantPosition>): Promise<Record<string, string>> {
  // todo: add props
  var participantList = participants
    .filter(x => sectionIds.includes(x.formationSectionId))
    .reduce((acc, item) => {
      const key = item.participantId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ParticipantPosition[]>);

  const animationPaths = Object.fromEntries(Object.entries((participantList))
    .map(([key, positionList]) => {
      const path = positionList
        .sort((a, b) => sectionIds.indexOf(a.formationSectionId) - sectionIds.indexOf(b.formationSectionId))
        .reduce((acc, point, index) => {
          if (index === 0) {
            return `M${point.x * gridSize} ${point.y * gridSize}`;
          } else {
            return `${acc} L${point.x * gridSize} ${point.y * gridSize}`;
          }
        }, "");
      return [key, path];
    }));

  return animationPaths;
}