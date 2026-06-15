import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { Prisma } from '@prisma/client';
import { PortalService, OrderReceiptDetail } from './portal.service';
import { RECEIPT_LOGO_PNG_BASE64 } from './receipt-logo';

// ── Company constants ─────────────────────────────────────────────────────────
// TODO: edit addressLines with the real street address before going live.
const COMPANY = {
  name: 'HTown Autos',
  addressLines: ['Houston, TX'], // <-- replace with real street address
  phone: '+1 (832) 308-8092',
  website: 'htownautos.com',
};

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_WIDTH = 612;  // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const LINE_H = 16;
const SECTION_GAP = 8;
const HEADER_BAND_H = 100;
const LOGO_MAX_H = 60;
const LOGO_MAX_W = 140;

// ── Money helper ──────────────────────────────────────────────────────────────
function fmtMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ── Drawing helper ────────────────────────────────────────────────────────────
interface Ctx {
  page: PDFPage;
  doc: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  y: number;
  pages: PDFPage[];
}

/** Adds a new page, resets y to top margin. */
function addPage(ctx: Ctx): void {
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.pages.push(page);
  ctx.page = page;
  ctx.y = PAGE_HEIGHT - MARGIN;
}

/** Draw a single text line; auto-paginates when near bottom. */
function drawLine(
  ctx: Ctx,
  text: string,
  x: number,
  fontSize: number,
  font: PDFFont,
  color = rgb(0, 0, 0),
): void {
  if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
  ctx.page.drawText(text, {
    x,
    y: ctx.y,
    size: fontSize,
    font,
    color,
  });
  ctx.y -= LINE_H;
}

/** Draw a horizontal rule. */
function drawRule(ctx: Ctx, x = MARGIN, width = PAGE_WIDTH - MARGIN * 2): void {
  if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
  ctx.page.drawLine({
    start: { x, y: ctx.y + 4 },
    end: { x: x + width, y: ctx.y + 4 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  ctx.y -= SECTION_GAP;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface ReceiptPdfOpts {
  buyerName: string;
  buyerEmail: string;
}

@Injectable()
export class ReceiptPdfService {
  constructor(private readonly portalService: PortalService) {}

  async buildOrderReceiptPdf(
    order: {
      id: string;
      type: string;
      status: string;
      description: string | null;
      amount: Prisma.Decimal | number | string;
      tenantId: string | null;
      metadata: unknown;
      createdAt: Date;
    },
    opts: ReceiptPdfOpts,
  ): Promise<Uint8Array> {
    const receiptNumber = order.id.slice(0, 8).toUpperCase();
    const totalCents = Math.round(Number(order.amount) * 100);
    const detail: OrderReceiptDetail | null =
      order.type === 'INSPECTION'
        ? await this.portalService.buildOrderReceiptDetail(order)
        : null;

    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);

    const firstPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const ctx: Ctx = {
      doc,
      page: firstPage,
      regular,
      bold,
      y: PAGE_HEIGHT - MARGIN,
      pages: [firstPage],
    };

    // ── Header band ───────────────────────────────────────────────────────────
    // Background band
    ctx.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_BAND_H,
      width: PAGE_WIDTH,
      height: HEADER_BAND_H,
      color: rgb(0.05, 0.05, 0.05),
    });

    // Embed logo (PNG)
    try {
      const logoBytes = Buffer.from(RECEIPT_LOGO_PNG_BASE64, 'base64');
      const logoImg = await doc.embedPng(logoBytes);
      const logoNat = logoImg.scale(1);
      const scale = Math.min(
        LOGO_MAX_W / logoNat.width,
        LOGO_MAX_H / logoNat.height,
        1,
      );
      const logoW = logoNat.width * scale;
      const logoH = logoNat.height * scale;
      const logoY = PAGE_HEIGHT - HEADER_BAND_H + (HEADER_BAND_H - logoH) / 2;
      ctx.page.drawImage(logoImg, {
        x: MARGIN,
        y: logoY,
        width: logoW,
        height: logoH,
      });
    } catch {
      // Logo embed failure is non-fatal — continue without it.
    }

    // Company info on the right side of header
    const companyX = PAGE_WIDTH - MARGIN - 180;
    let companyY = PAGE_HEIGHT - MARGIN - 4;
    const companyLines = [
      COMPANY.name,
      ...COMPANY.addressLines,
      COMPANY.phone,
      COMPANY.website,
    ];
    for (const line of companyLines) {
      const isName = line === COMPANY.name;
      ctx.page.drawText(line, {
        x: companyX,
        y: companyY,
        size: isName ? 11 : 9,
        font: isName ? bold : regular,
        color: rgb(1, 1, 1),
      });
      companyY -= isName ? 14 : 12;
    }

    ctx.y = PAGE_HEIGHT - HEADER_BAND_H - 20;

    // ── Title + meta ──────────────────────────────────────────────────────────
    drawLine(ctx, 'RECIBO / RECEIPT', MARGIN, 18, bold);
    ctx.y -= 4;
    drawLine(ctx, `No. ${receiptNumber}`, MARGIN, 10, regular, rgb(0.3, 0.3, 0.3));
    drawLine(
      ctx,
      `Fecha / Date: ${fmtDate(order.createdAt)}`,
      MARGIN,
      10,
      regular,
      rgb(0.3, 0.3, 0.3),
    );
    drawLine(
      ctx,
      `Estado / Status: ${order.status}`,
      MARGIN,
      10,
      regular,
      rgb(0.3, 0.3, 0.3),
    );
    ctx.y -= SECTION_GAP;
    drawRule(ctx);

    // ── Customer block ────────────────────────────────────────────────────────
    drawLine(ctx, 'Cliente / Customer', MARGIN, 10, bold, rgb(0.3, 0.3, 0.3));
    drawLine(ctx, opts.buyerName || '—', MARGIN + 8, 11, bold);
    if (opts.buyerEmail) {
      drawLine(ctx, opts.buyerEmail, MARGIN + 8, 10, regular);
    }
    ctx.y -= SECTION_GAP;
    drawRule(ctx);

    // ── Order body ────────────────────────────────────────────────────────────
    if (order.type === 'INSPECTION' && detail) {
      // Per-yard sections
      for (const yard of detail.byYard) {
        const yardLabel = yard.yardName ?? yard.yardId;
        const cityState =
          yard.location?.city || yard.location?.state
            ? ` — ${[yard.location.city, yard.location.state].filter(Boolean).join(', ')}`
            : '';
        drawLine(ctx, `${yardLabel}${cityState}`, MARGIN, 11, bold);
        ctx.y -= 2;

        for (const v of yard.vehicles) {
          const identifier = v.vin
            ? v.vin
            : v.lotNumber
              ? `Lote ${v.lotNumber}`
              : '—';
          const vehicleDesc =
            [v.year, v.make, v.model].filter(Boolean).join(' ') || '—';
          const leftText = `  ${identifier}  ·  ${vehicleDesc}`;
          const rightText = fmtMoney(yard.inspectionFeeCents);

          // Truncate left text if too long
          const maxLeftChars = 60;
          const truncated =
            leftText.length > maxLeftChars
              ? leftText.slice(0, maxLeftChars - 1) + '…'
              : leftText;

          const rightX = PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(rightText, 10);
          if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
          ctx.page.drawText(truncated, {
            x: MARGIN,
            y: ctx.y,
            size: 10,
            font: regular,
          });
          ctx.page.drawText(rightText, {
            x: rightX,
            y: ctx.y,
            size: 10,
            font: regular,
          });
          ctx.y -= LINE_H;
        }

        // Travel fee line
        const travelLabel = '  Tarifa de traslado / Travel fee';
        const travelAmt = fmtMoney(yard.travelFeeCents);
        const travelX = PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(travelAmt, 10);
        if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
        ctx.page.drawText(travelLabel, {
          x: MARGIN,
          y: ctx.y,
          size: 10,
          font: regular,
          color: rgb(0.4, 0.4, 0.4),
        });
        ctx.page.drawText(travelAmt, {
          x: travelX,
          y: ctx.y,
          size: 10,
          font: regular,
          color: rgb(0.4, 0.4, 0.4),
        });
        ctx.y -= LINE_H;

        // Per-yard subtotal
        const yardSubLabel = `  Subtotal ${yardLabel}`;
        const yardSubAmt = fmtMoney(yard.inspectionSubtotalCents + yard.travelFeeCents);
        const yardSubX = PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(yardSubAmt, 10);
        if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
        ctx.page.drawText(yardSubLabel, {
          x: MARGIN,
          y: ctx.y,
          size: 10,
          font: bold,
        });
        ctx.page.drawText(yardSubAmt, {
          x: yardSubX,
          y: ctx.y,
          size: 10,
          font: bold,
        });
        ctx.y -= LINE_H + SECTION_GAP;
      }

      drawRule(ctx);
      ctx.y -= 4;

      // Totals
      const totalsRows: [string, string][] = [
        ['Subtotal inspecciones', fmtMoney(detail.inspectionSubtotalCents)],
        ['Subtotal traslados', fmtMoney(detail.travelSubtotalCents)],
      ];
      for (const [label, val] of totalsRows) {
        const valX = PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(val, 10);
        if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
        ctx.page.drawText(label, { x: MARGIN, y: ctx.y, size: 10, font: regular });
        ctx.page.drawText(val, { x: valX, y: ctx.y, size: 10, font: regular });
        ctx.y -= LINE_H;
      }

      ctx.y -= 4;
      const totalAmt = fmtMoney(detail.totalCents);
      const totalX = PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(totalAmt, 13);
      if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
      ctx.page.drawText('TOTAL', { x: MARGIN, y: ctx.y, size: 13, font: bold });
      ctx.page.drawText(totalAmt, { x: totalX, y: ctx.y, size: 13, font: bold });
      ctx.y -= LINE_H * 2;
    } else {
      // DEPOSIT or other order type
      const depositLabel = 'Depósito a cuenta / Account deposit';
      const depositAmt = fmtMoney(totalCents);
      if (order.description) {
        drawLine(ctx, order.description, MARGIN, 10, regular, rgb(0.4, 0.4, 0.4));
      }
      drawLine(ctx, depositLabel, MARGIN + 8, 11, regular);
      ctx.y -= 4;
      drawRule(ctx);
      const totalX = PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(depositAmt, 13);
      if (ctx.y < MARGIN + LINE_H * 3) addPage(ctx);
      ctx.page.drawText('TOTAL', { x: MARGIN, y: ctx.y, size: 13, font: bold });
      ctx.page.drawText(depositAmt, { x: totalX, y: ctx.y, size: 13, font: bold });
      ctx.y -= LINE_H * 2;
    }

    // ── Footer on last page ───────────────────────────────────────────────────
    const lastPage = ctx.pages[ctx.pages.length - 1];
    lastPage.drawText(`${COMPANY.name}  ·  ${COMPANY.website}`, {
      x: MARGIN,
      y: MARGIN / 2,
      size: 8,
      font: regular,
      color: rgb(0.6, 0.6, 0.6),
    });
    lastPage.drawText(`Recibo ${receiptNumber}  ·  ${fmtDate(order.createdAt)}`, {
      x: PAGE_WIDTH - MARGIN - 160,
      y: MARGIN / 2,
      size: 8,
      font: regular,
      color: rgb(0.6, 0.6, 0.6),
    });

    return doc.save();
  }
}
