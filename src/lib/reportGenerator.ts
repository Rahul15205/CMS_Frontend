import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Report Data Per Category ────────────────────────────────────
const reportContent: Record<
  string,
  {
    title: string;
    summaryHeaders: string[];
    summaryRows: (string | number)[][];
    detailHeaders: string[];
    detailRows: (string | number)[][];
  }
> = {
  consent: {
    title: "Consent Management Report",
    summaryHeaders: ["Metric", "Value", "Change vs Last Period"],
    summaryRows: [
      ["Total Active Consents", "12,450", "+12.5%"],
      ["Expired & Withdrawn", "3,230", "+3.2%"],
      ["New Consents (Period)", "1,845", "+15.0%"],
      ["Consent Collection Rate", "94.5%", "+2.1%"],
      ["Opt-in Rate", "87.2%", "+1.8%"],
      ["Avg Processing Time", "2.3s", "-0.5s"],
    ],
    detailHeaders: ["Purpose", "Active", "Expired", "Withdrawn", "Rate"],
    detailRows: [
      ["Marketing Communications", "4,200", "890", "340", "82.5%"],
      ["Analytics & Tracking", "3,800", "450", "210", "89.4%"],
      ["Essential Services", "2,900", "120", "30", "96.0%"],
      ["Third-Party Sharing", "1,550", "770", "550", "66.8%"],
    ],
  },
  rights: {
    title: "Rights Fulfilment Report",
    summaryHeaders: ["Metric", "Value", "Change vs Last Period"],
    summaryRows: [
      ["Total Requests Received", "156", "+8.0%"],
      ["Requests Completed", "112", "+12.0%"],
      ["Requests In Progress", "32", "-5.0%"],
      ["Requests Pending", "12", "-3.0%"],
      ["SLA Compliance Rate", "95.5%", "+2.5%"],
      ["Avg Resolution Time", "4.2 days", "-0.8 days"],
    ],
    detailHeaders: ["Request Type", "Received", "Completed", "Pending", "Avg Days"],
    detailRows: [
      ["Data Access", "45", "38", "4", "3.2"],
      ["Data Erasure", "32", "25", "3", "5.1"],
      ["Data Correction", "28", "22", "2", "2.8"],
      ["Data Portability", "18", "12", "1", "6.4"],
      ["Withdraw Consent", "15", "10", "1", "1.5"],
      ["File Complaint", "10", "3", "1", "8.2"],
      ["Nominate Representative", "8", "2", "0", "4.0"],
    ],
  },
  grievance: {
    title: "Grievance Handling Report",
    summaryHeaders: ["Metric", "Value", "Change vs Last Period"],
    summaryRows: [
      ["Total Grievances Filed", "48", "+15.0%"],
      ["Grievances Resolved", "35", "+20.0%"],
      ["Grievances In Progress", "8", "-10.0%"],
      ["Grievances Pending", "5", "-5.0%"],
      ["Resolution Rate", "72.9%", "+5.2%"],
      ["Avg Resolution Time", "6.3 days", "-1.2 days"],
    ],
    detailHeaders: ["Category", "Filed", "Resolved", "Pending", "Avg Days"],
    detailRows: [
      ["Data Breach Concern", "15", "12", "2", "4.8"],
      ["Consent Violation", "12", "9", "1", "5.2"],
      ["Unauthorized Access", "8", "6", "1", "7.1"],
      ["Processing Objection", "7", "5", "1", "8.5"],
      ["Rectification Delay", "6", "3", "0", "6.0"],
    ],
  },
  compliance: {
    title: "Compliance Status Report",
    summaryHeaders: ["Metric", "Score", "Status"],
    summaryRows: [
      ["Overall Compliance Score", "92.5%", "Strong"],
      ["DPDP Act Compliance", "95.0%", "Excellent"],
      ["GDPR Compliance", "88.0%", "Good"],
      ["CCPA Compliance", "91.0%", "Strong"],
      ["LGPD Compliance", "89.5%", "Good"],
      ["Internal Audit Score", "94.0%", "Excellent"],
    ],
    detailHeaders: ["Control Area", "Score", "Findings", "Remediated", "Risk Level"],
    detailRows: [
      ["Data Collection", "96%", "2", "2", "Low"],
      ["Consent Management", "94%", "3", "2", "Low"],
      ["Rights Processing", "91%", "4", "3", "Medium"],
      ["Data Retention", "88%", "5", "3", "Medium"],
      ["Third-Party Sharing", "85%", "6", "4", "Medium"],
      ["Breach Notification", "93%", "2", "2", "Low"],
      ["DPO Operations", "97%", "1", "1", "Low"],
    ],
  },
};

// ─── Category Title Mapping ──────────────────────────────────────
const categoryTitles: Record<string, string> = {
  consent: "Consent",
  rights: "Rights Fulfilment",
  grievance: "Grievance",
  compliance: "Compliance",
};

// ─── PDF Generation ──────────────────────────────────────────────
export function generatePDFReport(
  category: string,
  startDate?: string,
  endDate?: string
): void {
  const data = reportContent[category];
  if (!data) return;

  const doc = new jsPDF();
  const brandGreen: [number, number, number] = [10, 51, 27];
  const now = new Date();

  // ── Header ─────────────────────────
  doc.setFillColor(...brandGreen);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(data.title, 14, 18);

  doc.setFontSize(10);
  doc.text("Proteccio — Consent Management System", 14, 26);

  // ── Meta info ──────────────────────
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  let yPos = 44;

  doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 14, yPos);
  yPos += 6;

  if (startDate && endDate) {
    doc.text(`Report Period: ${startDate} to ${endDate}`, 14, yPos);
    yPos += 6;
  }

  doc.text(`Report Type: ${categoryTitles[category] || category}`, 14, yPos);
  yPos += 10;

  // ── Summary Table ──────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.text("Executive Summary", 14, yPos);
  yPos += 4;

  autoTable(doc, {
    head: [data.summaryHeaders],
    body: data.summaryRows,
    startY: yPos,
    theme: "grid",
    headStyles: {
      fillColor: brandGreen,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 248, 240] },
    margin: { left: 14, right: 14 },
  });

  // Get the Y position after the first table
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 60;
  yPos = finalY + 14;

  // ── Detail Table ───────────────────
  doc.setFontSize(13);
  doc.text("Detailed Breakdown", 14, yPos);
  yPos += 4;

  autoTable(doc, {
    head: [data.detailHeaders],
    body: data.detailRows,
    startY: yPos,
    theme: "grid",
    headStyles: {
      fillColor: brandGreen,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 248, 240] },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ─────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Proteccio CMS | Confidential | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  // ── Save ───────────────────────────
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  doc.save(`${category}_report_${dateStr}.pdf`);
}

// ─── CSV Generation ──────────────────────────────────────────────
export function generateCSVReport(
  category: string,
  startDate?: string,
  endDate?: string
): void {
  const data = reportContent[category];
  if (!data) return;

  const now = new Date();
  const lines: string[] = [];

  // Header info
  lines.push(`"${data.title}"`);
  lines.push(`"Generated","${now.toLocaleDateString()} ${now.toLocaleTimeString()}"`);
  if (startDate && endDate) {
    lines.push(`"Period","${startDate} to ${endDate}"`);
  }
  lines.push("");

  // Summary section
  lines.push('"Executive Summary"');
  lines.push(data.summaryHeaders.map((h) => `"${h}"`).join(","));
  data.summaryRows.forEach((row) => {
    lines.push(row.map((cell) => `"${cell}"`).join(","));
  });
  lines.push("");

  // Detail section
  lines.push('"Detailed Breakdown"');
  lines.push(data.detailHeaders.map((h) => `"${h}"`).join(","));
  data.detailRows.forEach((row) => {
    lines.push(row.map((cell) => `"${cell}"`).join(","));
  });

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  a.download = `${category}_report_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main Generate Function ─────────────────────────────────────
export function generateReport(
  category: string,
  format: string,
  startDate?: string,
  endDate?: string
): void {
  if (format === "pdf") {
    generatePDFReport(category, startDate, endDate);
  } else {
    // CSV and Excel both output CSV (Excel can open CSV)
    generateCSVReport(category, startDate, endDate);
  }
}

// ─── Get Estimated File Size ─────────────────────────────────────
export function getEstimatedSize(format: string): string {
  switch (format) {
    case "pdf":
      return "~120 KB";
    case "csv":
      return "~8 KB";
    case "excel":
      return "~12 KB";
    default:
      return "~10 KB";
  }
}
