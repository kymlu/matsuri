import { dbController } from "../../data/DBProvider.tsx";
import { Festival } from "../../models/Festival.ts";
import { FormationSection } from "../../models/FormationSection.ts";
import { ImportExportModel } from "../../models/ImportExportModel.ts";
import { Participant } from "../../models/Participant.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { ParticipantPosition, PropPosition, NotePosition } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { Song } from "../../models/Song.ts";
import { formatExportDate } from "./DateHelper.ts";

export function exportAllData() {
  Promise.all([
    dbController.getAll("festival"),
    dbController.getAll("category"),
    dbController.getAll("formationSection"),
    dbController.getAll("participant"),
    dbController.getAll("participantPosition"),
    dbController.getAll("prop"),
    dbController.getAll("propPosition"),
    dbController.getAll("notePosition"),
    dbController.getAll("song"),
  ]).then(([festivals, categories, formationSections, participants, participantPositions, props, propPositions, notePositions, songs]) => {
    var toExport: ImportExportModel = {
      song: songs as Song[],
      festival: festivals as Festival[],
      formationSections: formationSections as FormationSection[],
      participants: participants as Participant[],
      categories: categories as ParticipantCategory[],
      participantPositions: participantPositions as ParticipantPosition[],
      props: props as Prop[],
      propPositions: propPositions as PropPosition[],
      notes: notePositions as NotePosition[],
    };
    downloadJson(JSON.stringify(toExport));
  });
}

export async function exportFormationData(formationId: string) {
  Promise.all([
    dbController.getAll("festival"),
    dbController.getByFormationId("formationSection", formationId),
    dbController.getAll("category"),
    dbController.getAll("song"),
  ]).then(async ([festivals, formationSections, categories, songs]) => {
    Promise.all([
      dbController.getByFormationId("participant", formationId),
      dbController.getByFormationId("prop", formationId),
    ]).then(async ([participants, props]) => {
      var sectionIds = (formationSections as FormationSection[]).map(x => x.id);
      var participantPositions = (await Promise.all(sectionIds.map(id => dbController.getByFormationSectionId("participantPosition", id)))).flatMap(x => x);
      var propPositions = (await Promise.all(sectionIds.map(id => dbController.getByFormationSectionId("propPosition", id)))).flatMap(x => x);
      var notePositions = (await Promise.all(sectionIds.map(id => dbController.getByFormationSectionId("notePosition", id)))).flatMap(x => x);

      var toExport: ImportExportModel = {
        song: songs as Song[],
        festival: (festivals as Festival[]).filter(x => x.formations.map(x => x.id).includes(formationId)),
        formationSections: formationSections as FormationSection[],
        participants: participants as Participant[],
        categories: categories as ParticipantCategory[],
        participantPositions: participantPositions as ParticipantPosition[],
        props: props as Prop[],
        propPositions: propPositions as PropPosition[],
        notes: notePositions as NotePosition[],
      };
      downloadJson(JSON.stringify(toExport));
    })

  });
}

function downloadJson(data: string) {
  downloadFile(data, "application/json", `matsuri_formation_${formatExportDate(new Date)}.json`)
}

export function downloadFile(data: string, type: string, fileName: string) {
  const blob = new Blob([data], { type: type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}