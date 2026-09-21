import type { SavingsBlueprint } from "@/lib/tool-leads.functions";
import { money } from "@/lib/savings-calculator-data";

/** Brand palette, matched to the site's Noir/Gold theme. */
const NOIR: [number, number, number] = [11, 11, 13];
const GOLD: [number, number, number] = [212, 175, 90];
const CREAM: [number, number, number] = [238, 235, 228];
const MUTED: [number, number, number] = [150, 147, 140];

type Totals = { hoursWeek: number; hoursMonth: number; moneyMonth: number; moneyYear: number; rate: number };

export async function downloadBlueprintPdf(blueprint: SavingsBlueprint, totals: Totals) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const paintPage = () => {
    doc.setFillColor(...NOIR);
    doc.rect(0, 0, W, H, "F");
  };

  const newPage = () => {
    doc.addPage();
    paintPage();
    y = M;
  };

  const need = (h: number) => {
    if (y + h > H - M) newPage();
  };

  const text = (
    value: string,
    opts: { size?: number; color?: [number, number, number]; style?: "normal" | "bold"; gap?: number; indent?: number } = {},
  ) => {
    const size = opts.size ?? 10.5;
    doc.setFont("helvetica", opts.style ?? "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? CREAM));
    const indent = opts.indent ?? 0;
    const lines = doc.splitTextToSize(value, W - M * 2 - indent) as string[];
    for (const line of lines) {
      need(size + 6);
      doc.text(line, M + indent, y);
      y += size + 4;
    }
    y += opts.gap ?? 0;
  };

  paintPage();
  y = M + 16;

  // Header
  doc.setFillColor(...GOLD);
  doc.roundedRect(M, y - 22, 30, 30, 6, 6, "F");
  doc.setTextColor(...NOIR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AI", M + 7, y - 2);
  doc.setTextColor(...CREAM);
  doc.setFontSize(13);
  doc.text("Income Systems Lab", M + 42, y - 2);
  y += 34;

  text("Your AI Automation Blueprint", { size: 24, style: "bold", color: GOLD, gap: 4 });
  text(blueprint.headline, { size: 13, style: "bold", gap: 6 });
  text(blueprint.summary, { color: MUTED, gap: 14 });

  // Numbers panel
  need(78);
  doc.setFillColor(24, 23, 26);
  doc.roundedRect(M, y - 4, W - M * 2, 72, 10, 10, "F");
  const cells: Array<[string, string]> = [
    ["Hours / week", totals.hoursWeek.toFixed(1)],
    ["Hours / month", totals.hoursMonth.toFixed(0)],
    ["Value / month", money(totals.moneyMonth)],
    ["Value / year", money(totals.moneyYear)],
  ];
  const cw = (W - M * 2) / cells.length;
  cells.forEach(([label, value], i) => {
    const x = M + cw * i + 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, y + 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...GOLD);
    doc.text(value, x, y + 42);
  });
  y += 88;

  text(`Based on your time being worth ${money(totals.rate)}/hour.`, { size: 9, color: MUTED, gap: 16 });

  // Workflows
  text("The three workflows to build first", { size: 14, style: "bold", color: GOLD, gap: 8 });
  for (const w of blueprint.workflows) {
    need(60);
    text(`${w.rank}. ${w.title}`, { size: 12.5, style: "bold", gap: 2 });
    text(`Task: ${w.task}   |   Tools: ${w.tools.join(", ")}`, { size: 9, color: MUTED, gap: 4 });
    text(w.why, { color: MUTED, gap: 6 });
    text(`Trigger: ${w.trigger}`, { style: "bold", color: GOLD, gap: 2 });
    w.steps.forEach((s, i) => text(`${i + 1}. ${s}`, { indent: 14, gap: 0 }));
    text(`Output: ${w.output}`, { style: "bold", color: GOLD, gap: 16 });
  }

  // Caveats
  text("Honest caveats", { size: 14, style: "bold", color: GOLD, gap: 8 });
  for (const c of blueprint.caveats) text(`• ${c}`, { color: MUTED, indent: 4 });
  y += 10;
  text(
    "Estimates only. Your mileage will vary depending on how much you actually implement.",
    { size: 9, color: MUTED, gap: 6 },
  );
  text("ai-income-systems.com", { size: 9, color: GOLD });

  doc.save("ai-automation-blueprint.pdf");
}
