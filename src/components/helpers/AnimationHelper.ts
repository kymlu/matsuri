import { dbController } from "../../data/DBProvider.tsx";
import { ParticipantPosition } from "../../models/Position.ts";

export async function getAnimationPaths(formationId: string, sectionIds: string[], gridSize: number): Promise<Record<string, string>> {
  const res1 = await dbController.getAll("participantPosition");

  // todo: add props
  var participantList = (res1 as Array<ParticipantPosition>)
    .filter(x => sectionIds.includes(x.formationSceneId))
    .reduce((acc, item) => {
      const key = item.participantId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ParticipantPosition[]>);

  const animationPaths = Object.fromEntries(Object.entries((participantList))
    .map(([key_1, positionList]) => {
      const path = positionList
        .sort((a, b) => sectionIds.indexOf(a.formationSceneId) - sectionIds.indexOf(b.formationSceneId))
        .reduce((acc_1, point, index) => {
          if (index === 0) {
            return `M${point.x * gridSize} ${point.y * gridSize}`;
          } else {
            return `${acc_1} L${point.x * gridSize} ${point.y * gridSize}`;
          }
        }, "");
      return [key_1, path];
    }));

  return animationPaths;
}