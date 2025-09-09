import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition } from "../../models/Position.ts";

export async function getAnimationPaths(sectionIds: string[], gridSize: number): Promise<Record<string, string>> {
  const results = await Promise.all(
    sectionIds.map((id) => dbController.getByFormationSectionId("participantPosition", id))
  );

  // todo: add props
  var participantList = (results.flat() as Array<ParticipantPosition>)
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