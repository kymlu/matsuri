import { DEFAULT_TOP_MARGIN, DEFAULT_SIDE_MARGIN } from "../data/consts.ts";
import { AnimationPath } from "../models/AnimationPath.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { ParticipantPosition } from "../models/Position.ts";

export function generateAnimationPaths(
  sections: Array<FormationSection>,
  participantPositions: ParticipantPosition[],
  gridSize: number,
  topMargin?: number,
  sideMargin?: number,
): AnimationPath[]{
  var newPaths: AnimationPath[] = [];
      
  Array.from({length: sections?.length - 1}).forEach((_, i) => {
    newPaths.push(
      {
        fromSectionId: sections[i].id,
        toSectionId: sections[i + 1].id,
        paths: getAnimationPaths(
          [sections[i].id, sections[i + 1].id],
          gridSize,
          participantPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        )
      },
      {
        fromSectionId: sections[i + 1].id,
        toSectionId: sections[i].id,
        paths: getAnimationPaths(
          [sections[i + 1].id, sections[i].id],
          gridSize,
          participantPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        )
      }
    );
  });
  return newPaths;
}

export function getAnimationPaths(
  sectionIds: string[],
  gridSize: number,
  participants: Array<ParticipantPosition>,
  topMargin: number,
  sideMargin: number,
): Record<string, string> {
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
            return `M${(point.x + sideMargin) * gridSize} ${(point.y + topMargin) * gridSize}`;
          } else {
            return `${acc} L${(point.x + sideMargin) * gridSize} ${(point.y + topMargin) * gridSize}`;
          }
        }, "");
      return [key, path];
    }));

  return animationPaths;
}