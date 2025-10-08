import { FormationSection } from "../models/FormationSection.ts";
import { Participant } from "../models/Participant.ts";
import { ParticipantPosition, PropPosition, NotePosition, ArrowPosition } from "../models/Position.ts";
import { Prop } from "../models/Prop.ts";
import { dbController } from "./../lib/dataAccess/DBProvider.tsx";

export async function GetAllForFormation(
  festivalId: string,
  formationId: string,
  thenFn: (
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
  ) => void
): Promise<void> {
  const [
    formationSection,
    participant,
    prop,
    participantPosition,
    propPosition,
    notePosition,
    arrowPosition,
  ] = await Promise.all([
    dbController.getByFormationId("formationSection", formationId),
    dbController.getByFestivalId("participant", festivalId),
    dbController.getByFestivalId("prop", festivalId),
    dbController.getAll("participantPosition"),
    dbController.getAll("propPosition"),
    dbController.getAll("notePosition"),
    dbController.getAll("arrowPosition"),
  ]);

  const formationSections = formationSection as FormationSection[];
  const participants = participant as Participant[];
  const props = prop as Prop[];
  const participantPositions = participantPosition as ParticipantPosition[];
  const propPositions = propPosition as PropPosition[];
  const notePositions = notePosition as NotePosition[];
  const arrowPositions = arrowPosition as ArrowPosition[];

  // Call the callback with all values
  thenFn(
    formationSections,
    participants,
    props,
    participantPositions,
    propPositions,
    notePositions,
    arrowPositions,
  );
}