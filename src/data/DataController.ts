import { Festival } from "../models/Festival.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { Participant, ParticipantPlaceholder } from "../models/Participant.ts";
import { ParticipantPosition, PropPosition, NotePosition, ArrowPosition, PlaceholderPosition } from "../models/Position.ts";
import { Prop } from "../models/Prop.ts";
import { dbController } from "./../lib/dataAccess/DBProvider.tsx";

export async function GetAllForFormation(
  festivalId: string,
  formationId: string,
  thenFn: (
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    placeholder: ParticipantPlaceholder[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
    placeholderPosition: PlaceholderPosition[]
  ) => void
): Promise<void> {
  console.log("GetAllForFormation", { festivalId, formationId });
  const [
    formationSection,
    participant,
    prop,
    placeholder,
    participantPosition,
    propPosition,
    notePosition,
    arrowPosition,
    placeholderPosition,
  ] = await Promise.all([
    dbController.getByFormationId("formationSection", formationId),
    dbController.getByFestivalId("participant", festivalId),
    dbController.getByFestivalId("prop", festivalId),
    dbController.getByFormationId("placeholder", formationId),
    dbController.getAll("participantPosition"),
    dbController.getAll("propPosition"),
    dbController.getAll("notePosition"),
    dbController.getAll("arrowPosition"),
    dbController.getAll("placeholderPosition"),
  ]);

  const formationSections = formationSection as FormationSection[];
  const formationIds = new Set(formationSections.map(fs => fs.id));
  const participants = participant as Participant[];
  const props = prop as Prop[];
  const placeholders = placeholder as ParticipantPlaceholder[];
  const participantPositions = (participantPosition as ParticipantPosition[]).filter(pp => formationIds.has(pp.formationSectionId));
  const propPositions = (propPosition as PropPosition[]).filter(pp => formationIds.has(pp.formationSectionId));
  const notePositions = (notePosition as NotePosition[]).filter(np => formationIds.has(np.formationSectionId));
  const arrowPositions = (arrowPosition as ArrowPosition[]).filter(ap => formationIds.has(ap.formationSectionId));
  const placeholderPositions = (placeholderPosition as PlaceholderPosition[]).filter(pp => formationIds.has(pp.formationSectionId));

  // Call the callback with all values
  thenFn(
    formationSections,
    participants,
    props,
    placeholders,
    participantPositions,
    propPositions,
    notePositions,
    arrowPositions,
    placeholderPositions
  );
}

export async function getAllData(
  thenFn: (
    festival: Festival[],
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    placeholder: ParticipantPlaceholder[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
    placeholderPosition: PlaceholderPosition[],
  ) => void
  ) {
  const [
    festival,
    formationSection,
    participant,
    prop,
    placeholder,
    participantPosition,
    propPosition,
    notePosition,
    arrowPosition,
    placeholderPosition,
  ] = await Promise.all([
    dbController.getAll("festival"),
    dbController.getAll("formationSection"),
    dbController.getAll("participant"),
    dbController.getAll("prop"),
    dbController.getAll("placeholder"),
    dbController.getAll("participantPosition"),
    dbController.getAll("propPosition"),
    dbController.getAll("notePosition"),
    dbController.getAll("arrowPosition"),
    dbController.getAll("placeholderPosition"),
  ]);

  const festivals = festival as Festival[];
  const formationSections = formationSection as FormationSection[];
  const participants = participant as Participant[];
  const props = prop as Prop[];
  const placeholders = placeholder as ParticipantPlaceholder[];
  const participantPositions = participantPosition as ParticipantPosition[];
  const propPositions = propPosition as PropPosition[];
  const notePositions = notePosition as NotePosition[];
  const arrowPositions = arrowPosition as ArrowPosition[];
  const placeholderPositions = placeholderPosition as PlaceholderPosition[];

  // Call the callback with all values
  thenFn(
    festivals,
    formationSections,
    participants,
    props,
    placeholders,
    participantPositions,
    propPositions,
    notePositions,
    arrowPositions,
    placeholderPositions,
  );
}

export async function clearAllData() {
  await Promise.all([
    dbController.deleteAll("festival"),
    dbController.deleteAll("formationSection"),
    dbController.deleteAll("participant"),
    dbController.deleteAll("prop"),
    dbController.deleteAll("placeholder"),
    dbController.deleteAll("participantPosition"),
    dbController.deleteAll("propPosition"),
    dbController.deleteAll("notePosition"),
    dbController.deleteAll("arrowPosition"),
    dbController.deleteAll("placeholderPosition"),
  ]);
}