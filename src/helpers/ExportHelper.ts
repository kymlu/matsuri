import jsPDF from "jspdf";
import { DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_BOTTOM_MARGIN } from "../data/consts.ts";
import { dbController } from "../data/DBProvider.tsx";
import { Festival } from "../models/Festival.ts";
import { Formation, FormationType } from "../models/Formation.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { ImportExportModel } from "../models/ImportExportModel.ts";
import { Participant } from "../models/Participant.ts";
import { ParticipantCategory } from "../models/ParticipantCategory.ts";
import { ParticipantPosition, PropPosition, NotePosition } from "../models/Position.ts";
import { Prop } from "../models/Prop.ts";
import { Song } from "../models/Song.ts";
import { basePalette } from "../themes/colours.ts";
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

export async function exportToPdf(
  fileName: string,
  formation: Formation,
  sections: FormationSection[],
  participantPositions: Record<string, ParticipantPosition[]>,
  participants: Record<string, Participant>,
  propPositions: Record<string, PropPosition[]>,
  props: Record<string, Prop>,
  notePositions: Record<string, NotePosition[]>,
  categories: Record<string, ParticipantCategory>,
  updateProgress: (progress: number) => void,
) {
  const grid : number = 20;
  const sideMargin = formation.sideMargin ?? DEFAULT_SIDE_MARGIN;
  const topMargin = formation.topMargin ?? DEFAULT_TOP_MARGIN;
  const bottomMargin = formation.bottomMargin ?? DEFAULT_BOTTOM_MARGIN;
  const width = formation.width + sideMargin * 2;
  const length = formation.length + topMargin + bottomMargin;
  const pdf = new jsPDF({
    orientation: formation.width > formation.length ? "landscape" : "portrait",
    unit: "px",
    format: [width * grid, length * grid]});

  pdf.setLanguage("ja");

  const get_text_file = async (weight: "Regular" | "Bold") => {
    const res = await fetch(`${process.env.PUBLIC_URL}/fonts/NotoSansJP-${weight}.txt`);
  
    // check for errors
    if (!res.ok) {
      throw res;
    }
  
    return res.text();
  };

  pdf.addFileToVFS("NotoSansJpBold.ttf", await get_text_file("Bold"));
  pdf.addFont("NotoSansJpBold.ttf", "NotoSansJPBold", "normal");
  pdf.setFont("NotoSansJPBold");

  console.log("Exporting to PDF: ", fileName);
  var sortedSections = sections.sort((a, b) => a.order - b.order);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sortedSections[i];

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    console.log("Exporting section", section.displayName);

    pdf.setDrawColor(basePalette.grey[400])

    pdf.setLineWidth(0.6);
    [...Array(length + 1)].forEach((_, i) => {
      if (i === 0 || i === length) return;

      if (i % 2 === length % 2) {
        pdf.setLineDashPattern([4, 2], 0);
        pdf.setDrawColor(basePalette.grey[400]);
      } else {
        pdf.setLineDashPattern([1, 1], 0);
        pdf.setDrawColor(basePalette.grey[300]);
      }
      pdf.line(0, (i) * grid, width * grid, (i) * grid);
    });

    [...Array(width + 1)].forEach((_, i) => {
      if (i === 0 || i === width) return;

      if (i % 2 === width % 2) {
        pdf.setLineWidth(0.6);
        pdf.setDrawColor(basePalette.grey[300])
        pdf.setLineDashPattern([1, 1], 0);
      } else {
        pdf.setLineDashPattern([4, 2], 0);

        if (i === width/2) {
          pdf.setLineWidth(0.8);
          pdf.setDrawColor(basePalette.primary.main);
        } else {
          pdf.setLineWidth(0.6);
          pdf.setDrawColor(basePalette.grey[400]);
        }          }
      pdf.line(i * grid, 0, i * grid, length * grid);
    });

    pdf.setLineDashPattern([1, 0], 0);
    pdf.setDrawColor(basePalette.primary.main)
    
    pdf.line(sideMargin * grid, grid * 2, sideMargin * grid, length * grid);
    pdf.line((width - sideMargin) * grid, grid * 2, (width - sideMargin) * grid, length * grid);
    if (formation?.type === FormationType.stage) {
      pdf.line((sideMargin - 1) * grid, (grid) * (formation.length + topMargin), (formation.width + sideMargin + 1) * grid, (formation.length + topMargin) * grid);
    }

    pdf.setFontSize(12);
    [...Array(length - 2)].forEach((_, i) => {
      // todo: if parade, move up to starting position so that it doesn't span the whole position
      pdf.text((formation.type === FormationType.parade ? Math.abs(length - i) : i).toString() + "m", (width - 2) * grid, (i + topMargin + 0.1) * grid);
    });
    [...Array(width)].forEach((_, i) => {
      if ((width / 2) % 2 === i % 2 && i !== 0 && i !== (width)) {
        pdf.setFontSize(8);
        pdf.setFillColor(basePalette.primary.main);
        pdf.setDrawColor(basePalette.primary.main);
        pdf.setTextColor(basePalette.white);
        pdf.circle(i * grid, grid * 1.3, grid * 0.25, "F");
        pdf.text(Math.abs(Math.round(i - width/2)).toString(), i * grid, grid * 1.4, {align: "center"});
      }
    });

    pdf.setLineWidth(0.8);
    pdf.setDrawColor(basePalette.black);
    pdf.setFillColor(basePalette.white);
    pdf.setTextColor(basePalette.black);
    var textWidth = pdf.getTextWidth(section.displayName);
    pdf.rect((width/2) * grid - textWidth/2 - grid, grid/4, textWidth + grid * 2, grid/2, "FD");
    pdf.text(section.displayName, (width/2) * grid, grid * 0.6, {align: "center"})

    notePositions[section.id]?.forEach(n => {
      pdf.setFontSize(grid * n.fontGridRatio)
      if (n.showBackground) {
        pdf.setDrawColor(n?.color?.borderColour ?? basePalette.black);
        pdf.setFillColor(n?.color?.bgColour ?? basePalette.white);
        pdf.roundedRect((sideMargin + n.x) * grid, (n.y + topMargin) * grid, n.width * grid, n.height * grid, n.borderRadius/2, n.borderRadius/2, "FD");
      }
      pdf.setTextColor(n?.color?.textColour ?? basePalette.black);
      if (n?.label) {
        pdf.text(n?.label ?? "", (sideMargin + n.x + 0.2) * grid, (topMargin + n.y + 0.2) * grid, {align: "left", baseline: "top", maxWidth: grid * n.width});
        pdf.line((sideMargin + n.x) * grid, (topMargin + n.y + 0.5) * grid, (sideMargin + n.x + n.width) * grid, (topMargin + n.y + 0.5) * grid);
      }
      var textHeight = pdf.getTextDimensions(n?.text ?? "", {maxWidth: grid * (n.width - 0.4)}).h;
      pdf.text(n?.text ?? "", (sideMargin + n.x + n.width/2) * grid, (topMargin + n.y + n.height/2 + (n?.label ? 0.2 : 0)) * grid - textHeight / 2, {align: "center", baseline: "top", maxWidth: grid * (n.width - 0.4)});
    });

    pdf.setFontSize(8)
    propPositions[section.id]?.forEach(p => {
      var prop = props[p.propId ?? ""]?.[0];
      pdf.setDrawColor(prop?.color?.borderColour ?? basePalette.black);
      pdf.setFillColor(prop?.color?.bgColour ?? basePalette.white);
      pdf.rect((sideMargin + p.x) * grid, (p.y + topMargin) * grid, prop.length * grid, grid, "FD");
      pdf.setTextColor(prop?.color?.textColour ?? basePalette.black);
      var textHeight = pdf.getTextDimensions(prop?.name ?? "", {maxWidth: grid * prop.length}).h;
      pdf.text(prop?.name ?? "", (sideMargin + p.x + prop.length/2) * grid, (topMargin + p.y + 0.5) * grid - textHeight/2, {align: "center", baseline: "top", maxWidth: grid * prop.length});
    });

    participantPositions[section.id]?.forEach(p => {
      var category = categories[p.categoryId ?? ""]?.[0];
      pdf.setDrawColor(category?.color.borderColour ?? basePalette.black);
      pdf.setFillColor(category?.color.bgColour ?? basePalette.white);
      pdf.circle((sideMargin + p.x) * grid, (p.y + topMargin) * grid, grid * 0.4, "FD");
      var participant = participants[p.participantId]?.[0];
      pdf.setTextColor(category?.color.textColour ?? basePalette.black);
      var textHeight = pdf.getTextDimensions(participant?.displayName ?? "", {maxWidth: grid}).h;
      pdf.text(participant?.displayName ?? "", (sideMargin + p.x) * grid, (topMargin + p.y) * grid - textHeight/2, {align: "center", baseline: "top", maxWidth: grid});
    });

    updateProgress(Math.round(((i + 1) / sections.length) * 100));

    if (i < sections.length - 1) {
      pdf.addPage();
    }
  }

  pdf.save(fileName ?? `${formation.name}_formation.pdf`);
}