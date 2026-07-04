import PDFDocument from 'pdfkit';

import type { ResumeData } from '@/types';

function line(doc: InstanceType<typeof PDFDocument>, text: string, opts?: { bold?: boolean; size?: number }) {
  if (opts?.bold) doc.font('Helvetica-Bold');
  else doc.font('Helvetica');
  doc.fontSize(opts?.size ?? 10).text(text, { continued: false });
}

export async function renderResumePdf(content: ResumeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    line(doc, content.name || 'Resume', { bold: true, size: 18 });
    doc.moveDown(0.3);

    const contactParts = [
      content.email,
      content.phone,
      content.location,
      content.website,
      content.linkedin,
      content.github,
    ].filter(Boolean);
    if (contactParts.length) {
      line(doc, contactParts.join(' · '), { size: 9 });
      doc.moveDown(0.5);
    }

    if (content.headline?.trim()) {
      line(doc, content.headline.trim(), { bold: true, size: 11 });
      doc.moveDown(0.5);
    }

    if (content.bio?.trim()) {
      line(doc, 'Summary', { bold: true, size: 12 });
      line(doc, content.bio.trim());
      doc.moveDown(0.5);
    }

    if (content.skills?.length) {
      line(doc, 'Skills', { bold: true, size: 12 });
      line(doc, content.skills.join(', '));
      doc.moveDown(0.5);
    }

    if (content.experience?.length) {
      line(doc, 'Experience', { bold: true, size: 12 });
      doc.moveDown(0.2);
      for (const exp of content.experience) {
        const dates = [exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' – ');
        line(doc, `${exp.role} — ${exp.company}`, { bold: true });
        if (dates) line(doc, dates, { size: 9 });
        if (exp.location) line(doc, exp.location, { size: 9 });
        for (const bullet of exp.bullets ?? []) {
          line(doc, `• ${bullet}`);
        }
        doc.moveDown(0.3);
      }
    }

    if (content.projects?.length) {
      line(doc, 'Projects', { bold: true, size: 12 });
      doc.moveDown(0.2);
      for (const project of content.projects) {
        line(doc, project.name, { bold: true });
        if (project.description) line(doc, project.description);
        if (project.technologies?.length) {
          line(doc, project.technologies.join(', '), { size: 9 });
        }
        for (const bullet of project.bullets ?? []) {
          line(doc, `• ${bullet}`);
        }
        doc.moveDown(0.3);
      }
    }

    if (content.education?.length) {
      line(doc, 'Education', { bold: true, size: 12 });
      doc.moveDown(0.2);
      for (const edu of content.education) {
        line(doc, `${edu.degree}${edu.field ? `, ${edu.field}` : ''} — ${edu.institution}`, {
          bold: true,
        });
        const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
        if (dates) line(doc, dates, { size: 9 });
        doc.moveDown(0.2);
      }
    }

    doc.end();
  });
}
