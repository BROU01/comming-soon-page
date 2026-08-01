import PDFDocument from "pdfkit";
import type { Releve } from "./types/database";
import { generateQRCodeBuffer, getAppBaseUrl } from "./qr";

// Couleurs ESCEN (alignées sur le thème du site)
const NAVY = "#1D2B6B";
const CYAN = "#0EA5B7";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

/**
 * Génère le PDF officiel d'un relevé de notes ESCEN.
 * Inclut : bandeau ESCEN, infos étudiant, tableau des notes,
 * moyenne, mention, et le QR Code de vérification (en haut à droite).
 */
export async function generateRelevePDF(releve: Releve): Promise<Buffer> {
  const qrBuffer = await generateQRCodeBuffer(releve.id);

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Relevé de notes — ${releve.student_name}`,
      Author: "ESCEN University",
    },
  });

  // Collecte des chunks du stream PDF
  const chunks: Buffer[] = [];
  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const pageWidth = doc.page.width - 50 * 2; // 595.28 - 100
  let y = 50;

  // ── Bandeau ESCEN ──────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 90).fill(NAVY);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22);
  doc.text("ESCEN University", 50, 26, { width: pageWidth * 0.6 });
  doc.font("Helvetica").fontSize(11);
  doc.text("Relevé de notes officiel", 50, 56, { width: pageWidth * 0.6 });
  doc.text("Official transcript of records", 50, 72, {
    width: pageWidth * 0.6,
  });

  // QR Code en haut à droite
  doc.image(qrBuffer, doc.page.width - 50 - 62, 14, {
    fit: [62, 62],
    align: "center",
    valign: "center",
  });

  y = 130;

  // ── Date d'émission ────────────────────────────────────
  const issueDate = new Date(releve.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.fillColor(MUTED).font("Helvetica").fontSize(10);
  doc.text(`Date d'émission : ${issueDate}`, 50, y, { width: pageWidth });
  y += 24;

  // ── Infos étudiant ─────────────────────────────────────
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12);
  doc.text("Étudiant", 50, y);
  y += 18;

  const infoFields: Array<[string, string]> = [
    ["Nom complet", releve.student_name],
    ["N° étudiant", releve.student_id],
    ["Promotion", releve.promo || "—"],
    ["ID du relevé", releve.id],
  ];

  const colWidth = pageWidth / 2;
  doc.font("Helvetica").fontSize(10);
  infoFields.forEach(([label, value], i) => {
    const x = 50 + (i % 2) * colWidth;
    const rowY = y + Math.floor(i / 2) * 34;
    doc.fillColor(MUTED).text(label.toUpperCase(), x, rowY, {
      width: colWidth - 20,
    });
    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .text(value, x, rowY + 14, { width: colWidth - 20 });
    doc.font("Helvetica");
  });

  y += 72;

  // ── Tableau des notes ──────────────────────────────────
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12);
  doc.text("Détail des notes", 50, y);
  y += 22;

  const tableLeft = 50;
  const tableRight = 50 + pageWidth;
  const colMatiere = pageWidth * 0.5;
  const colCode = pageWidth * 0.2;
  const colCredit = pageWidth * 0.12;
  const colNote = pageWidth * 0.18;
  const headerH = 22;
  const rowH = 20;

  // En-tête du tableau
  doc.rect(tableLeft, y, pageWidth, headerH).fill(CYAN);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
  doc.text("MATIÈRE", tableLeft + 6, y + 6);
  doc.text("CODE", tableLeft + colMatiere + 6, y + 6);
  doc.text("CRÉDITS", tableLeft + colMatiere + colCode + 6, y + 6, {
    width: colCredit - 12,
    align: "right",
  });
  doc.text("NOTE", tableLeft + pageWidth - colNote + 6, y + 6, {
    width: colNote - 12,
    align: "right",
  });
  y += headerH;

  // Rows
  doc.font("Helvetica").fontSize(9.5);
  const notes = releve.notes_data ?? [];
  notes.forEach((note, i) => {
    // Gestion des pages multiples : si on approche du bas, nouvelle page
    if (y > doc.page.height - 90) {
      doc.addPage();
      y = 50;
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11);
      doc.text("Détail des notes (suite)", 50, y);
      y += 20;
      doc.rect(tableLeft, y, pageWidth, headerH).fill(CYAN);
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
      doc.text("MATIÈRE", tableLeft + 6, y + 6);
      doc.text("CODE", tableLeft + colMatiere + 6, y + 6);
      doc.text("CRÉDITS", tableLeft + colMatiere + colCode + 6, y + 6, {
        width: colCredit - 12,
        align: "right",
      });
      doc.text("NOTE", tableLeft + pageWidth - colNote + 6, y + 6, {
        width: colNote - 12,
        align: "right",
      });
      y += headerH;
      doc.font("Helvetica").fontSize(9.5);
    }

    if (i % 2 === 1) {
      doc.rect(tableLeft, y, pageWidth, rowH).fill("#F8FAFC");
    }
    doc.fillColor(TEXT).font("Helvetica-Bold");
    doc.text(note.matiere, tableLeft + 6, y + 5, {
      width: colMatiere - 12,
    });
    doc.font("Helvetica");
    doc.fillColor(MUTED);
    doc.text(note.code, tableLeft + colMatiere + 6, y + 5, {
      width: colCode - 12,
    });
    doc.text(String(note.credit), tableLeft + colMatiere + colCode + 6, y + 5, {
      width: colCredit - 12,
      align: "right",
    });
    doc.fillColor(NAVY).font("Helvetica-Bold");
    doc.text(note.note.toFixed(2), tableLeft + pageWidth - colNote + 6, y + 5, {
      width: colNote - 12,
      align: "right",
    });
    doc.font("Helvetica");
    y += rowH;
  });

  // Ligne de bas du tableau
  doc.moveTo(tableLeft, y).lineTo(tableRight, y).strokeColor(BORDER).stroke();
  y += 16;

  // ── Résumé : moyenne + mention + statut ────────────────
  doc
    .rect(tableLeft, y, pageWidth, 56)
    .fill("#F0F9FA")
    .strokeColor(CYAN)
    .lineWidth(1)
    .stroke();

  const summaryItems: Array<[string, string]> = [
    ["Moyenne générale", releve.moyenne > 0 ? `${releve.moyenne.toFixed(2)}/20` : "—"],
    ["Mention", releve.mention || "—"],
    ["Statut", "Actif"],
  ];

  const itemW = pageWidth / 3;
  summaryItems.forEach(([label, value], i) => {
    const x = tableLeft + i * itemW;
    doc.fillColor(MUTED).font("Helvetica").fontSize(8);
    doc.text(label.toUpperCase(), x + 10, y + 10, { width: itemW - 20 });
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12);
    doc.text(value, x + 10, y + 26, { width: itemW - 20 });
  });

  y += 76;

  // ── Pied de page ───────────────────────────────────────
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Document officiel généré par ESCEN University. " +
        "Vérifiable en scannant le QR Code ou sur " +
        getAppBaseUrl(),
      50,
      y
    );

  doc.end();
  return pdfPromise;
}
