import jsPDF from "jspdf";
import { DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_BOTTOM_MARGIN } from "../data/consts.ts";
import { dbController } from "../data/DBProvider.tsx";
import { Festival } from "../models/Festival.ts";
import { Formation, FormationType } from "../models/Formation.ts";
import { FormationSection } from "../models/FormationSection.ts";
import { ImportExportModel } from "../models/ImportExportModel.ts";
import { Participant } from "../models/Participant.ts";
import { ParticipantCategory } from "../models/ParticipantCategory.ts";
import { ParticipantPosition, PropPosition, NotePosition, ArrowPosition } from "../models/Position.ts";
import { Prop } from "../models/Prop.ts";
import { Song } from "../models/Song.ts";
import { basePalette, objectPalette } from "../themes/colours.ts";
import { formatExportDate } from "./DateHelper.ts";
import { roundToTenth, strEquals } from "./GlobalHelper.ts";

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
    dbController.getAll("arrowPosition"),
    dbController.getAll("song"),
  ]).then(([festivals, categories, formationSections, participants, participantPositions, props, propPositions, notePositions, arrowPositions, songs]) => {
    var toExport: ImportExportModel = {
      song: songs as Song[],
      festival: festivals as Festival[],
      formationSections: formationSections as FormationSection[],
      participants: participants as Participant[],
      categories: categories as ParticipantCategory[],
      participantPositions: participantPositions as ParticipantPosition[],
      props: props as Prop[],
      propPositions: propPositions as PropPosition[],
      arrowPositions: arrowPositions as ArrowPosition[],
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
      var arrowPositions = (await Promise.all(sectionIds.map(id => dbController.getByFormationSectionId("arrowPosition", id)))).flatMap(x => x);

      var toExport: ImportExportModel = {
        song: songs as Song[],
        festival: (festivals as Festival[]).filter(x => x.formations.map(x => x.id).includes(formationId)),
        formationSections: formationSections as FormationSection[],
        participants: participants as Participant[],
        categories: categories as ParticipantCategory[],
        participantPositions: participantPositions as ParticipantPosition[],
        props: props as Prop[],
        propPositions: propPositions as PropPosition[],
        arrowPositions: arrowPositions as ArrowPosition[],
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
  propPositions: Record<string, PropPosition[]>, // todo: add arrows
  props: Record<string, Prop>,
  notePositions: Record<string, NotePosition[]>,
  categories: Record<string, ParticipantCategory>,
  updateProgress: (progress: number) => void,
  followingId?: string | null,
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

  var context = pdf.context2d;
  context.font = "NotoSansJP";

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

        if (i === width/2) {
          pdf.setDrawColor(basePalette.primary.main);
        } else {
          pdf.setDrawColor(basePalette.grey[300])
        }
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
        pdf.circle(i * grid, grid * 1.5, grid * 0.25, "F");
        pdf.text(Math.abs(Math.round(i - width/2)).toString(), i * grid, grid * 1.6, {align: "center"});
      }
    });

    pdf.setLineWidth(0.8);
    pdf.setDrawColor(objectPalette.purple.main);
    pdf.setFillColor(objectPalette.purple.main);
    pdf.setTextColor(basePalette.white);
    var textDimension = pdf.getTextDimensions(section.displayName, {maxWidth: grid * 4});
    pdf.roundedRect(grid/2, grid/4, grid * 4, grid, 5, 5, "FD");
    pdf.text(section.displayName, grid/2 + grid * 2, 0.75 * grid + textDimension.h/2 - 1, {maxWidth: grid * 4, align: "center"})

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
      var prop = props[p.propId];

      context.save();
      const propX = (sideMargin + p.x) * grid;
      const propY = (topMargin + p.y) * grid;
      const propHeight = grid;
      const propWidth = grid * prop.length;

      const centerX = propX + propWidth/2;
      const centerY = propY + propHeight/2;
      
      context.translate(centerX, centerY);
      context.rotate(p.angle * Math.PI/180);

      context.fillStyle = prop?.color?.bgColour ?? basePalette.white;
      context.fillRect(-propWidth/2, -propHeight/2, propWidth, propHeight);
      context.strokeStyle = prop?.color?.borderColour ?? basePalette.black;
      context.rect(-propWidth/2, -propHeight/2, propWidth, propHeight);

      context.fillStyle = prop.color?.textColour ?? basePalette.black;
      var textDimension = pdf.getTextDimensions(prop?.name ?? "", {maxWidth: propWidth});
      context.fillText(prop?.name ?? "",
        -propWidth/2 + ((grid * prop.length - textDimension.w)/2),
        -propHeight/2 + 0.25 * grid + ((grid - textDimension.h)/2),
        grid * prop.length);

      context.restore();
    });

    participantPositions[section.id]?.forEach(p => {
      var category = categories[p.categoryId ?? ""];
      var participant = participants[p.participantId];
      const isFollowing = strEquals(followingId, participant.id);
      
      if (isFollowing) {
        pdf.setLineWidth(2);
        pdf.setDrawColor(basePalette.primary.main);
      } else {
        pdf.setLineWidth(0.8);
        pdf.setDrawColor(category?.color.borderColour ?? basePalette.black);
      }

      pdf.setFillColor(category?.color.bgColour ?? basePalette.white);
      pdf.circle((sideMargin + p.x) * grid, (p.y + topMargin) * grid, grid * 0.4, "FD");

      pdf.setTextColor(category?.color.textColour ?? basePalette.black);
      var displayName = participant?.displayName ?? "";
      var textHeight = pdf.getTextDimensions(displayName, {maxWidth: grid}).h;
      pdf.text(displayName, (sideMargin + p.x) * grid, (topMargin + p.y) * grid - textHeight/2, {align: "center", baseline: "top", maxWidth: grid});

      if (isFollowing) {
        pdf.setLineWidth(0.8);
        pdf.setDrawColor(basePalette.grey[800]);
        pdf.setFillColor(basePalette.grey[50]);
        pdf.roundedRect((width - 4.5) * grid, grid/4, grid * 4, grid, 5, 5, "FD");
        var coordsText = `${displayName} : ↕︎${roundToTenth(p.y)} ↔︎${roundToTenth(Math.abs(formation.width/2 - p.x))}`
        var coordsDimensions = pdf.getTextDimensions(coordsText, {maxWidth: grid * 4});
        var padding = pdf.getTextDimensions("000");
        pdf.text(coordsText, (width - 2.5) * grid + padding.w/2, grid * 0.75 + coordsDimensions.h/2 - 1, {maxWidth: grid * 4, align: "center"});
      }
    });

    updateProgress(Math.round(((i + 1) / sections.length) * 100));

    if (i < sections.length - 1) {
      pdf.addPage();
    }
  }

  pdf.save(fileName ?? `${formation.name}_formation.pdf`);
}