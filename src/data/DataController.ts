import { FormationSection } from "../models/FormationSection.ts";
import { Participant } from "../models/Participant.ts";
import { NotePosition, ParticipantPosition, PropPosition } from "../models/Position";
import { Prop } from "../models/Prop.ts";
import { dbController } from "./DBProvider.tsx";

export async function GetAllForFormation(
  formationId: string,
  thenFn: (
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[]
  ) => void
): Promise<void> {
  const [
    formationSection,
    participant,
    prop,
    participantPosition,
    propPosition,
    notePosition
  ] = await Promise.all([
    dbController.getByFormationId("formationSection", formationId),
    dbController.getByFormationId("participant", formationId),
    dbController.getByFormationId("prop", formationId),
    dbController.getAll("participantPosition"),
    dbController.getAll("propPosition"),
    dbController.getAll("notePosition")
  ]);

  const formationSections = formationSection as FormationSection[];
  const participants = participant as Participant[];
  const props = prop as Prop[];
  const participantPositions = participantPosition as ParticipantPosition[];
  const propPositions = propPosition as PropPosition[];
  const notePositions = notePosition as NotePosition[];

  // Call the callback with all values
  thenFn(
    formationSections,
    participants,
    props,
    participantPositions,
    propPositions,
    notePositions
  );
}
