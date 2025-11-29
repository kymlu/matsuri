import { strEquals } from "../lib/helpers/GlobalHelper.ts";
import { Festival } from "../models/Festival.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { Participant, ParticipantPlaceholder } from "../models/Participant.ts";
import { ParticipantPosition, PropPosition, NotePosition, ArrowPosition, PlaceholderPosition } from "../models/Position.ts";
import { Prop } from "../models/Prop.ts";
import { getByFormationId, getByFestivalId, getAll, deleteAll, getById } from "./DataRepository.ts";

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
    formationSections,
    participants,
    props,
    placeholders,
    participantPositions,
    propPositions,
    notePositions,
    arrowPositions,
    placeholderPositions,
  ] = await Promise.all([
    getByFormationId("formationSection", formationId),
    getByFestivalId("participant", festivalId),
    getByFestivalId("prop", festivalId),
    getByFormationId("placeholder", formationId),
    getAll("participantPosition"),
    getAll("propPosition"),
    getAll("notePosition"),
    getAll("arrowPosition"),
    getAll("placeholderPosition"),
  ]);

  const formationIds = new Set(formationSections.map(fs => fs.id));
  const filteredParticipantPositions = participantPositions.filter(pp => formationIds.has(pp.formationSectionId));
  const filteredPropPositions = propPositions.filter(pp => formationIds.has(pp.formationSectionId));
  const filteredNotePositions = notePositions.filter(np => formationIds.has(np.formationSectionId));
  const filteredArrowPositions = arrowPositions.filter(ap => formationIds.has(ap.formationSectionId));
  const filteredPlaceholderPositions = placeholderPositions.filter(pp => formationIds.has(pp.formationSectionId));

  // Call the callback with all values
  thenFn(
    formationSections,
    participants,
    props,
    placeholders,
    filteredParticipantPositions,
    filteredPropPositions,
    filteredNotePositions,
    filteredArrowPositions,
    filteredPlaceholderPositions
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
  ] = await Promise.all([
    getAll("festival"),
    getAll("formationSection"),
    getAll("participant"),
    getAll("prop"),
    getAll("placeholder"),
    getAll("participantPosition"),
    getAll("propPosition"),
    getAll("notePosition"),
    getAll("arrowPosition"),
    getAll("placeholderPosition"),
  ]);

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

export async function getAllDataForFestival(
  festivalId: string,
  thenFn: (
    festival: Festival,
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
  ] = await Promise.all([
    getById("festival", festivalId),
    getAll("formationSection"),
    getByFestivalId("participant", festivalId),
    getByFestivalId("prop", festivalId),
    getAll("placeholder"),
    getAll("participantPosition"),
    getAll("propPosition"),
    getAll("notePosition"),
    getAll("arrowPosition"),
    getAll("placeholderPosition"),
  ]);

  if (!festivals) return;

  const formationIds = new Set(festivals?.formations.map(f => f.id));
  const fsIds = new Set(formationSections.filter(fs => formationIds.has(fs.formationId)).map(fs => fs.id));

  // Call the callback with all values
  thenFn(
    festivals,
    formationSections.filter(fs => formationIds.has(fs.formationId)),
    participants,
    props,
    placeholders.filter(pp => formationIds.has(pp.formationId)),
    participantPositions.filter(pp => fsIds.has(pp.formationSectionId)),
    propPositions.filter(pp => fsIds.has(pp.formationSectionId)),
    notePositions.filter(pp => fsIds.has(pp.formationSectionId)),
    arrowPositions.filter(pp => fsIds.has(pp.formationSectionId)),
    placeholderPositions.filter(pp => fsIds.has(pp.formationSectionId)),
  );
}

export async function clearAllData() {
  await Promise.all([
    deleteAll("festival"),
    deleteAll("formationSection"),
    deleteAll("participant"),
    deleteAll("prop"),
    deleteAll("placeholder"),
    deleteAll("participantPosition"),
    deleteAll("propPosition"),
    deleteAll("notePosition"),
    deleteAll("arrowPosition"),
    deleteAll("placeholderPosition"),
  ]);
}