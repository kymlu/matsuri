import jsPDF from "jspdf";
import { Festival } from "../../models/Festival.ts";
import { Formation, FormationType } from "../../models/Formation.ts";
import { FormationSection } from "../../models/FormationSection.ts";
import { FestivalResources, ImportExportModel } from "../../models/ImportExportModel.ts";
import { Participant, ParticipantPlaceholder } from "../../models/Participant.ts";
import { ParticipantCategory } from "../../models/ParticipantCategory.ts";
import { ParticipantPosition, PropPosition, NotePosition, ArrowPosition, PlaceholderPosition } from "../../models/Position.ts";
import { Prop } from "../../models/Prop.ts";
import { basePalette, objectPalette } from "../../themes/colours.ts";
import { formatExportDate } from "./DateHelper.ts";
import { roundToTenth, strEquals } from "./GlobalHelper.ts";
import { DEFAULT_SIDE_MARGIN, DEFAULT_TOP_MARGIN, DEFAULT_BOTTOM_MARGIN } from "../consts.ts";
import { getAllData, getAllDataForFestival } from "../../data/DataController.ts";
import JSZip from "jszip";

export function exportAllData() {
  getAllData((
    festivals: Festival[],
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    placeholders: ParticipantPlaceholder[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
    placeholderPositions: PlaceholderPosition[],
  ) => {
    var toExport: ImportExportModel = {
      festival: festivals as Festival[],
      formationSections: formationSections as FormationSection[],
      participants: participants as Participant[],
      participantPositions: participantPositions as ParticipantPosition[],
      props: props as Prop[],
      propPositions: propPositions as PropPosition[],
      arrowPositions: arrowPositions as ArrowPosition[],
      notes: notePositions as NotePosition[],
      placeholders: placeholders as ParticipantPlaceholder[],
      placeholderPositions: placeholderPositions as PlaceholderPosition[],
    };
    downloadFile(JSON.stringify(toExport), "application/json", `matsuri_formation_${formatExportDate(new Date)}.mtr`)
  });
}

export function exportFestivalData(festivalId: string) {
  getAllDataForFestival(festivalId, (
    festival: Festival,
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    placeholders: ParticipantPlaceholder[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
    placeholderPositions: PlaceholderPosition[],
  ) => {
    var toExport: ImportExportModel = {
      festival: [festival as Festival],
      formationSections: formationSections as FormationSection[],
      participants: participants as Participant[],
      participantPositions: participantPositions as ParticipantPosition[],
      props: props as Prop[],
      propPositions: propPositions as PropPosition[],
      arrowPositions: arrowPositions as ArrowPosition[],
      notes: notePositions as NotePosition[],
      placeholders: placeholders as ParticipantPlaceholder[],
      placeholderPositions: placeholderPositions as PlaceholderPosition[],
    };
    downloadFile(JSON.stringify(toExport), "application/json", `${festival.name}.mtr`)
  });
}

export function exportForGithub(festivalId: string) {
  getAllDataForFestival(festivalId, (
    festival: Festival,
    formationSections: FormationSection[],
    participants: Participant[],
    props: Prop[],
    placeholders: ParticipantPlaceholder[],
    participantPositions: ParticipantPosition[],
    propPositions: PropPosition[],
    notePositions: NotePosition[],
    arrowPositions: ArrowPosition[],
    placeholderPositions: PlaceholderPosition[],
  ) => {
    var exportZip = new JSZip();
    
    // festival file
    exportZip.file("festival.json", JSON.stringify(festival));

    // resources file
    var festivalResources: FestivalResources = {
      participants: participants,
      props: props,
    }
    exportZip.file("resources.json", JSON.stringify(festivalResources));

    // individual festival files
    festival.formations.forEach((formation) => {
      var sections = formationSections.filter(x => strEquals(x.formationId, formation.id));
      var sectionIds = new Set(sections.map(x => x.id));
      var toExport = {
        sections: sections,
        participants: participantPositions.filter(x => sectionIds.has(x.formationSectionId)),
        props: propPositions.filter(x => sectionIds.has(x.formationSectionId)),
        arrows: arrowPositions.filter(x => sectionIds.has(x.formationSectionId)),
        notes: notePositions.filter(x => sectionIds.has(x.formationSectionId)),
        placeholders: placeholders.filter(x => strEquals(x.formationId, formation.id)),
        placeholderPositions: placeholderPositions.filter(x => sectionIds.has(x.formationSectionId)),
      }
      exportZip.file(`${formation.name}.json`, JSON.stringify(toExport));
    })
    exportZip.generateAsync({type:"blob"})
      .then(function(content) {
        const url = URL.createObjectURL(content);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${festival.name}.zip`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  });
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
  placeholders: Record<string, ParticipantPlaceholder>,
  placeholderPositions: Record<string, PlaceholderPosition[]>,
  notePositions: Record<string, NotePosition[]>,
  arrowPositions: Record<string, ArrowPosition[]>,
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

    arrowPositions[section.id]?.forEach(a => {
      pdf.setLineWidth(a.width * grid);
      pdf.setLineDashPattern(a.isDotted ? [grid / 5, grid / 10] : [], 0);
      var arrowColor = a.color ?? basePalette.black;
      pdf.setDrawColor(arrowColor);
      pdf.setFillColor(arrowColor);
      // Todo: lines cannot control the tension so not allowing curves
      pdf.line((sideMargin + a.x + a.points[0]) * grid, (topMargin + a.y + a.points[1]) * grid, (sideMargin + a.x + a.points[2]) * grid, (topMargin + a.y + a.points[3]) * grid);
      if (a.points.length === 6) { 
        pdf.line((sideMargin + a.x + a.points[2]) * grid, (topMargin + a.y + a.points[3]) * grid, (sideMargin + a.x + a.points[4]) * grid, (topMargin + a.y + a.points[5]) * grid);
      }
      pdf.setLineDashPattern([], 0);
      if (a.pointerAtBeginning) {
        drawTriangleAtPoint([a.points[0], a.points[1]], [a.points[2], a.points[3]], [a.x, a.y], topMargin, sideMargin, grid, a.pointerWidth * a.width, a.pointerLength * a.width, pdf);
      }
      if (a.pointerAtEnding) {
        const endIndex = a.points.length === 6 ? 4 : 2;
        drawTriangleAtPoint([a.points[endIndex], a.points[endIndex + 1]], [a.points[endIndex - 2], a.points[endIndex - 1]], [a.x, a.y], topMargin, sideMargin, grid, a.pointerWidth * a.width, a.pointerLength * a.width, pdf);
      }
    });

    pdf.setLineDashPattern([], 0);
    pdf.setLineWidth(0.8);

    notePositions[section.id]?.forEach(n => {
      pdf.setFontSize(grid * n.fontGridRatio)
      if (n.color?.bgColour) {
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

    placeholderPositions[section.id]?.forEach(p => {
      var category = categories[p.categoryId ?? ""];
      var placeholder = placeholders[p.placeholderId];
      const isFollowing = strEquals(followingId, placeholder.id);
      
      pdf.setFillColor(category?.color.bgColour ?? basePalette.white);
      pdf.circle((sideMargin + p.x) * grid, (p.y + topMargin) * grid, grid * 0.4, "F");
      
      if (isFollowing) {
        pdf.setFillColor(basePalette.primary.main);
      } else {
        pdf.setFillColor(category?.color.borderColour ?? basePalette.black);
      }

      const numDots = 25; // Number of dots to create dashed line

      for (let i = 0; i < numDots; i++) {
        const angle = (2 * Math.PI / numDots) * i;
        const px = (sideMargin + p.x) * grid + grid * 0.4 * Math.cos(angle);
        const py = (p.y + topMargin) * grid + grid * 0.4 * Math.sin(angle);
        pdf.circle(px, py, isFollowing ? 0.75 : 0.5, "F");
      }

      pdf.setTextColor(category?.color.textColour ?? basePalette.black);
      var displayName = placeholder?.displayName ?? "";
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

  pdf.save(fileName ?? `${formation.id}_formation.pdf`);
}

type Point = [number, number];

function drawTriangleAtPoint(
  A: Point,
  B: Point,
  position: Point,
  topMargin: number,
  sideMargin: number,
  grid: number,
  width: number,
  length: number,
  pdf: jsPDF
){
  const [x1, y1] = A;
  const [x2, y2] = B;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLen = Math.hypot(dx, dy);

  if (lineLen === 0) {
    throw new Error("Points A and B must not be the same");
  }

  // Normalize direction vector
  let dirX = dx / lineLen;
  let dirY = dy / lineLen;

  // Perpendicular vector (90 degrees rotation)
  const perpX = -dirY;
  const perpY = dirX;

  // Tip point (either A or B depending on direction)
  const [tipX, tipY] = [x1, y1];

  // Base center = tip + (direction * length)
  const baseCenterX = tipX + dirX * length;
  const baseCenterY = tipY + dirY * length;

  const halfW = width / 2;
  // Triangle points: tip, left of base, right of base
  pdf.triangle(
    (tipX + sideMargin + position[0]) * grid,
    (tipY + topMargin + position[1]) * grid, 
    (baseCenterX + perpX * halfW + sideMargin + position[0]) * grid,
    (baseCenterY + perpY * halfW + topMargin + position[1]) * grid,
    (baseCenterX - perpX * halfW + sideMargin + position[0]) * grid,
    (baseCenterY - perpY * halfW + topMargin + position[1]) * grid,
    "FD");
}
