import { dbController } from "../../data/DBProvider.tsx";
import { Festival } from "../../models/Festival.ts";
import { FormationSection } from "../../models/FormationSection.ts";
import { ImportExportModel } from "../../models/ImportExportModel.ts";
import { Participant } from "../../models/Participant.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { ParticipantPosition, PropPosition, NotePosition } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { Song } from "../../models/Song.ts";

function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() is 0-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

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
  ]).then(([festivals, categories, formationSection, participant, participantPosition, prop, propPosition, notePosition, song]) => {
    // todo: move this to a helper
    var toExport: ImportExportModel = {
      song: song as Song[],
      festival: festivals as Festival[],
      formationSections: formationSection as FormationSection[],
      participants: participant as Participant[],
      categories: categories as ParticipantCategory[],
      participantPositions: participantPosition as ParticipantPosition[],
      props: prop as Prop[],
      propPositions: propPosition as PropPosition[],
      notes: notePosition as NotePosition[],
    };
    const blob = new Blob([JSON.stringify(toExport)], { type: "json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `matsuri_export_${formatDate(new Date)}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  })
}