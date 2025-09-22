import { DEFAULT_TOP_MARGIN, DEFAULT_SIDE_MARGIN } from "../data/consts.ts";
import { AnimationPath, Path } from "../models/AnimationPath.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { ParticipantPosition, PropPosition } from "../models/Position.ts";

export function generateAnimationPaths(
  sections: Array<FormationSection>,
  participantPositions: ParticipantPosition[],
  propPositions: PropPosition[],
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
        participantPaths: getParticipantAnimationPaths(
          [sections[i].id, sections[i + 1].id],
          gridSize,
          participantPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        ),
        propPaths: getPropAnimationPaths(
          [sections[i].id, sections[i + 1].id],
          gridSize,
          propPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        )
      },
      {
        fromSectionId: sections[i + 1].id,
        toSectionId: sections[i].id,
        participantPaths: getParticipantAnimationPaths(
          [sections[i + 1].id, sections[i].id],
          gridSize,
          participantPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        ),
        propPaths: getPropAnimationPaths(
          [sections[i + 1].id, sections[i].id],
          gridSize,
          propPositions,
          topMargin ?? DEFAULT_TOP_MARGIN,
          sideMargin ?? DEFAULT_SIDE_MARGIN
        )
      }
    );
  });
  return newPaths;
}

export function getParticipantAnimationPaths(
  sectionIds: string[],
  gridSize: number,
  participants: Array<ParticipantPosition>,
  topMargin: number,
  sideMargin: number,
): Record<string, Path> {
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
      return [key, {path: path}];
    }));

  return animationPaths;
}

export function getPropAnimationPaths(
  sectionIds: string[],
  gridSize: number,
  propPositions: Array<PropPosition>,
  topMargin: number,
  sideMargin: number,
): Record<string, Path> {
  // todo: add props
  var propsList = propPositions
    .filter(x => sectionIds.includes(x.formationSectionId))
    .reduce((acc, item) => {
      const key = item.propId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, PropPosition[]>);

  const animationPaths = Object.fromEntries(Object.entries((propsList))
    .map(([key, positionList]) => {
      var sorted = positionList
        .sort((a, b) => sectionIds.indexOf(a.formationSectionId) - sectionIds.indexOf(b.formationSectionId))
      const path = sorted
        .reduce((acc, point, index) => {
          if (index === 0) {
            return `M${(point.x + sideMargin) * gridSize} ${(point.y + topMargin) * gridSize}`;
          } else {
            return `${acc} L${(point.x + sideMargin) * gridSize} ${(point.y + topMargin) * gridSize}`;
          }
        }, "");
      return [key, {path: path, fromAngle: sorted[0].angle, toAngle: sorted[1].angle} as Path];
    }));

  return animationPaths;
}