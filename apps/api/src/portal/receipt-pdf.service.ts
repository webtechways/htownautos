import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { Prisma } from '@prisma/client';
import { PortalService, OrderReceiptDetail } from './portal.service';
import { RECEIPT_LOGO_PNG_BASE64 } from './receipt-logo';

// ── Company constants ─────────────────────────────────────────────────────────
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
const LINE_H = 15;
const SECTION_GAP = 10;
const HEADER_BAND_H = 96;
const LOGO_MAX_H = 58;
const LOGO_MAX_W = 140;

// Table column x-positions and widths
const COL_QTY_X = MARGIN;
const COL_QTY_W = 32;
const COL_DESC_X = COL_QTY_X + COL_QTY_W + 6;
const COL_UNIT_W = 72;
const COL_AMT_W = 72;
const COL_AMT_X = PAGE_WIDTH - MARGIN - COL_AMT_W;
const COL_UNIT_X = COL_AMT_X - COL_UNIT_W - 4;
const COL_DESC_W = COL_UNIT_X - COL_DESC_X - 4;

// Table header fill color (dark slate)
const TABLE_HEADER_COLOR = rgb(0.12, 0.15, 0.22);
const TABLE_ROW_ALT_COLOR = rgb(0.97, 0.97, 0.98);

// ── Money helper ──────────────────────────────────────────────────────────────
function fmtMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: Date): string {
  // "16 jun 2026" — Spanish locale, e.g. "16 jun. 2026"
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtStatus(status: string): string {
  const map: Record<string, string> = {
    PAID: 'Pagado',
    FULFILLED: 'Completado',
    PENDING: 'Pendiente',
    CANCELED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  };
  return map[status] ?? status;
}

// ── Drawing context ───────────────────────────────────────────────────────────
interface Ctx {
  page: PDFPage;
  doc: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  y: number;
  pages: PDFPage[];
}

function addPage(ctx: Ctx): void {
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.pages.push(page);
  ctx.page = page;
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: Ctx, needed = LINE_H * 3): void {
  if (ctx.y < MARGIN + needed) addPage(ctx);
}

/** Draw text at an exact (x, y) on the current page. Does NOT move ctx.y. */
function drawText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  font: PDFFont,
  color = rgb(0, 0, 0),
): void {
  ctx.page.drawText(text, { x, y, size: fontSize, font, color });
}

/** Draw a line advancing ctx.y by LINE_H. Auto-paginates. */
function drawLine(
  ctx: Ctx,
  text: string,
  x: number,
  fontSize: number,
  font: PDFFont,
  color = rgb(0, 0, 0),
): void {
  ensureSpace(ctx, LINE_H * 3);
  ctx.page.drawText(text, { x, y: ctx.y, size: fontSize, font, color });
  ctx.y -= LINE_H;
}

/** Draw right-aligned text at a fixed right edge. */
function drawTextRight(
  ctx: Ctx,
  text: string,
  rightEdge: number,
  y: number,
  fontSize: number,
  font: PDFFont,
  color = rgb(0, 0, 0),
): void {
  const w = font.widthOfTextAtSize(text, fontSize);
  ctx.page.drawText(text, { x: rightEdge - w, y, size: fontSize, font, color });
}

/** Truncate text to fit within maxWidth points. */
function truncateText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string {
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && font.widthOfTextAtSize(truncated + '…', fontSize) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/** Draw a horizontal rule. */
function drawRule(ctx: Ctx, color = rgb(0.82, 0.82, 0.82), thickness = 0.5): void {
  ensureSpace(ctx, LINE_H * 2);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 3 },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y + 3 },
    thickness,
    color,
  });
  ctx.y -= SECTION_GAP;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface ReceiptPdfOpts {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
}

interface LineItem {
  qty: number;
  description: string;
  unitCents: number;
  amountCents: number;
  /** When set, renders a small italic note below the description cell. */
  note?: string;
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
    const meta = (order.metadata ?? {}) as Record<string, any>;

    // ── Build line items by order type ────────────────────────────────────────
    const lineItems: LineItem[] = [];
    let serviceNote: string | null = null;
    let servicePreferences: string[] = [];

    let detail: OrderReceiptDetail | null = null;

    if (order.type === 'INSPECTION') {
      detail = await this.portalService.buildOrderReceiptDetail(order);
      if (detail) {
        for (const yard of detail.byYard) {
          const cityState =
            yard.location?.city || yard.location?.state
              ? ` (${[yard.location?.city, yard.location?.state].filter(Boolean).join(', ')})`
              : '';
          const yardLabel = yard.yardName ?? yard.yardId;

          for (const v of yard.vehicles) {
            const identifier = v.vin
              ? v.vin
              : v.lotNumber
                ? `Lote ${v.lotNumber}`
                : '—';
            const vehicleDesc =
              [v.year, v.make, v.model].filter(Boolean).join(' ') || '—';
            const description = `${identifier} · ${vehicleDesc} — ${yardLabel}${cityState}`;
            lineItems.push({
              qty: 1,
              description,
              unitCents: yard.inspectionFeeCents,
              amountCents: yard.inspectionFeeCents,
            });
          }

          // Travel fee row per yard
          lineItems.push({
            qty: 1,
            description: `Tarifa de traslado — ${yardLabel}`,
            unitCents: yard.travelFeeCents,
            amountCents: yard.travelFeeCents,
          });
        }
      }
    } else if (order.type === 'DEPOSIT') {
      lineItems.push({
        qty: 1,
        description: 'Depósito a cuenta',
        unitCents: totalCents,
        amountCents: totalCents,
      });
    } else if (order.type === 'SERVICE') {
      lineItems.push({
        qty: 1,
        description: 'Find a Car for Me — servicio',
        unitCents: totalCents,
        amountCents: totalCents,
      });
      serviceNote =
        'Incluye: inspección onsite de 6 vehículos con tus requerimientos, Carfax de esos 6, ' +
        'búsqueda de historial, puja hasta ganar alguno y tramitación de envío. ' +
        'No incluye: fee de Copart, brokeraje ni envío.';

      // Vehicle preferences from metadata
      const prefs = Array.isArray(meta['preferences']) ? meta['preferences'] : [];
      for (const p of prefs) {
        const models: string[] = Array.isArray(p['models']) ? p['models'] : [];
        const yearFrom = p['yearFrom'] != null ? String(p['yearFrom']) : null;
        const yearTo = p['yearTo'] != null ? String(p['yearTo']) : null;
        const yearRange =
          yearFrom && yearTo ? `${yearFrom}-${yearTo}` : yearFrom ?? yearTo ?? null;
        const parts = [
          p['make'],
          models.length ? models.join('/') : null,
          yearRange,
        ].filter(Boolean);
        if (parts.length) {
          servicePreferences.push(parts.join(' '));
        }
      }
    } else {
      // Fallback for unknown types
      lineItems.push({
        qty: 1,
        description: order.description ?? 'Servicio',
        unitCents: totalCents,
        amountCents: totalCents,
      });
    }

    // ── Create PDF ────────────────────────────────────────────────────────────
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

    // ── HEADER BAND ───────────────────────────────────────────────────────────
    ctx.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_BAND_H,
      width: PAGE_WIDTH,
      height: HEADER_BAND_H,
      color: rgb(0.06, 0.08, 0.14),
    });

    // Logo (left side of header)
    let logoW = 0;
    try {
      const logoBytes = Buffer.from(RECEIPT_LOGO_PNG_BASE64, 'base64');
      const logoImg = await doc.embedPng(logoBytes);
      const logoNat = logoImg.scale(1);
      const scale = Math.min(LOGO_MAX_W / logoNat.width, LOGO_MAX_H / logoNat.height, 1);
      logoW = logoNat.width * scale;
      const logoH = logoNat.height * scale;
      const logoY = PAGE_HEIGHT - HEADER_BAND_H + (HEADER_BAND_H - logoH) / 2;
      ctx.page.drawImage(logoImg, { x: MARGIN, y: logoY, width: logoW, height: logoH });
    } catch {
      /* Logo embed failure is non-fatal */
    }

    // "RECIBO / RECEIPT" big title — centered vertically in the header band
    const titleText = 'RECIBO / RECEIPT';
    const titleFontSize = 22;
    const titleW = bold.widthOfTextAtSize(titleText, titleFontSize);
    const titleX = (PAGE_WIDTH - titleW) / 2;
    const titleY = PAGE_HEIGHT - HEADER_BAND_H + (HEADER_BAND_H - titleFontSize) / 2 + 2;
    ctx.page.drawText(titleText, {
      x: titleX,
      y: titleY,
      size: titleFontSize,
      font: bold,
      color: rgb(1, 1, 1),
    });

    // Company block (right side of header, white text)
    const companyX = PAGE_WIDTH - MARGIN - 150;
    let companyY = PAGE_HEIGHT - MARGIN - 4;
    const companyLines = [COMPANY.name, ...COMPANY.addressLines, COMPANY.phone, COMPANY.website];
    for (const line of companyLines) {
      const isName = line === COMPANY.name;
      ctx.page.drawText(line, {
        x: companyX,
        y: companyY,
        size: isName ? 10 : 8,
        font: isName ? bold : regular,
        color: rgb(1, 1, 1),
      });
      companyY -= isName ? 13 : 11;
    }

    ctx.y = PAGE_HEIGHT - HEADER_BAND_H - 18;

    // ── BILL TO + META block (two-column layout) ──────────────────────────────
    const metaLabelColor = rgb(0.38, 0.38, 0.42);
    const metaValueColor = rgb(0.08, 0.08, 0.12);
    const billToX = MARGIN;
    const metaX = PAGE_WIDTH - MARGIN - 160;
    const blockTopY = ctx.y;

    // Left column: FACTURAR A / BILL TO
    drawText(ctx, 'FACTURAR A / BILL TO', billToX, blockTopY, 7.5, bold, rgb(0.45, 0.45, 0.50));
    drawText(ctx, opts.buyerName || '—', billToX, blockTopY - 14, 11, bold, metaValueColor);
    let billToY = blockTopY - 27;
    if (opts.buyerEmail) {
      drawText(ctx, opts.buyerEmail, billToX, billToY, 9, regular, metaValueColor);
      billToY -= 13;
    }
    if (opts.buyerPhone) {
      drawText(ctx, opts.buyerPhone, billToX, billToY, 9, regular, metaValueColor);
    }

    // Right column: meta rows
    const metaRows: [string, string][] = [
      ['RECIBO #', receiptNumber],
      ['FECHA', fmtDate(order.createdAt)],
      ['ESTADO', fmtStatus(order.status)],
    ];
    let metaY = blockTopY;
    for (const [label, value] of metaRows) {
      drawText(ctx, label, metaX, metaY, 7.5, bold, rgb(0.45, 0.45, 0.50));
      drawTextRight(ctx, value, PAGE_WIDTH - MARGIN, metaY, 9, regular, metaValueColor);
      metaY -= 14;
    }

    ctx.y = blockTopY - 54;
    ctx.y -= SECTION_GAP;
    drawRule(ctx, rgb(0.78, 0.78, 0.82), 0.8);

    // ── TABLE HEADER ──────────────────────────────────────────────────────────
    const tableHeaderH = 18;
    ensureSpace(ctx, tableHeaderH + LINE_H * 4);

    ctx.page.drawRectangle({
      x: MARGIN,
      y: ctx.y - tableHeaderH + 4,
      width: PAGE_WIDTH - MARGIN * 2,
      height: tableHeaderH,
      color: TABLE_HEADER_COLOR,
    });

    const tableHeaderY = ctx.y - 10;
    ctx.page.drawText('CANT.', { x: COL_QTY_X + 2, y: tableHeaderY, size: 7.5, font: bold, color: rgb(1, 1, 1) });
    ctx.page.drawText('DESCRIPCIÓN', { x: COL_DESC_X, y: tableHeaderY, size: 7.5, font: bold, color: rgb(1, 1, 1) });
    // Right-align PRECIO UNIT. and IMPORTE headers
    const unitHdrW = bold.widthOfTextAtSize('PRECIO UNIT.', 7.5);
    ctx.page.drawText('PRECIO UNIT.', { x: COL_UNIT_X + COL_UNIT_W - unitHdrW, y: tableHeaderY, size: 7.5, font: bold, color: rgb(1, 1, 1) });
    const amtHdrW = bold.widthOfTextAtSize('IMPORTE', 7.5);
    ctx.page.drawText('IMPORTE', { x: COL_AMT_X + COL_AMT_W - amtHdrW, y: tableHeaderY, size: 7.5, font: bold, color: rgb(1, 1, 1) });

    ctx.y -= tableHeaderH + 2;

    // ── TABLE ROWS ────────────────────────────────────────────────────────────
    const rowFontSize = 8.5;
    let rowIndex = 0;

    for (const item of lineItems) {
      const rowH = LINE_H + (item.note ? 11 : 0);
      ensureSpace(ctx, rowH + 4);

      // Alternate row fill
      if (rowIndex % 2 === 1) {
        ctx.page.drawRectangle({
          x: MARGIN,
          y: ctx.y - rowH + LINE_H - 1,
          width: PAGE_WIDTH - MARGIN * 2,
          height: rowH,
          color: TABLE_ROW_ALT_COLOR,
        });
      }

      const rowY = ctx.y;
      // QTY
      ctx.page.drawText(String(item.qty), { x: COL_QTY_X + 2, y: rowY, size: rowFontSize, font: regular });
      // Description — truncate to column width
      const descTruncated = truncateText(item.description, regular, rowFontSize, COL_DESC_W);
      ctx.page.drawText(descTruncated, { x: COL_DESC_X, y: rowY, size: rowFontSize, font: regular });
      // Unit price (right-aligned)
      drawTextRight(ctx, fmtMoney(item.unitCents), COL_UNIT_X + COL_UNIT_W, rowY, rowFontSize, regular);
      // Amount (right-aligned)
      drawTextRight(ctx, fmtMoney(item.amountCents), COL_AMT_X + COL_AMT_W, rowY, rowFontSize, regular);

      ctx.y -= LINE_H;

      // Optional note line inside the row
      if (item.note) {
        ensureSpace(ctx, 12);
        ctx.page.drawText(item.note, {
          x: COL_DESC_X,
          y: ctx.y,
          size: 7,
          font: regular,
          color: rgb(0.45, 0.45, 0.50),
        });
        ctx.y -= 11;
      }

      rowIndex++;
    }

    // ── SERVICE extra notes ───────────────────────────────────────────────────
    if (serviceNote) {
      ctx.y -= 4;
      ensureSpace(ctx, LINE_H * 5);

      // Preference list
      if (servicePreferences.length) {
        ctx.y -= 4;
        drawLine(ctx, 'Preferencias de vehículo:', COL_DESC_X, 7.5, bold, rgb(0.35, 0.35, 0.40));
        for (const pref of servicePreferences) {
          drawLine(ctx, `  · ${pref}`, COL_DESC_X, 8, regular, rgb(0.3, 0.3, 0.35));
        }
      }

      ctx.y -= 4;
      // Note — wrap by sentences
      const sentences = serviceNote.split(/(?<=\.) /);
      for (const sentence of sentences) {
        drawLine(ctx, sentence.trim(), COL_DESC_X, 7.5, regular, rgb(0.40, 0.40, 0.45));
      }
    }

    // ── TOTALS block ──────────────────────────────────────────────────────────
    ctx.y -= SECTION_GAP;
    drawRule(ctx, rgb(0.72, 0.72, 0.78), 0.8);
    ctx.y -= 2;

    const totalsLabelX = COL_UNIT_X;
    const totalsRightEdge = PAGE_WIDTH - MARGIN;

    if (order.type === 'INSPECTION' && detail) {
      ensureSpace(ctx, LINE_H * 3 + 8);
      const subtotalRows: [string, number][] = [
        ['Subtotal inspecciones', detail.inspectionSubtotalCents],
        ['Subtotal traslados', detail.travelSubtotalCents],
        ['Impuestos', 0],
      ];
      for (const [label, cents] of subtotalRows) {
        const rowY = ctx.y;
        drawText(ctx, label, totalsLabelX, rowY, 8.5, regular, rgb(0.3, 0.3, 0.35));
        drawTextRight(ctx, fmtMoney(cents), totalsRightEdge, rowY, 8.5, regular, rgb(0.3, 0.3, 0.35));
        ctx.y -= LINE_H;
      }
    } else {
      // DEPOSIT / SERVICE — just show a subtotal line
      ensureSpace(ctx, LINE_H + 8);
      const rowY = ctx.y;
      drawText(ctx, 'Subtotal', totalsLabelX, rowY, 8.5, regular, rgb(0.3, 0.3, 0.35));
      drawTextRight(ctx, fmtMoney(totalCents), totalsRightEdge, rowY, 8.5, regular, rgb(0.3, 0.3, 0.35));
      ctx.y -= LINE_H;

      // Taxes = 0
      const taxY = ctx.y;
      drawText(ctx, 'Impuestos', totalsLabelX, taxY, 8.5, regular, rgb(0.3, 0.3, 0.35));
      drawTextRight(ctx, '$0.00', totalsRightEdge, taxY, 8.5, regular, rgb(0.3, 0.3, 0.35));
      ctx.y -= LINE_H;
    }

    // Total line — bold, larger
    ctx.y -= 4;
    ensureSpace(ctx, 20);
    const totalDisplayCents =
      order.type === 'INSPECTION' && detail ? detail.totalCents : totalCents;

    // Filled bar behind the total row (from totalsLabelX-8 to right margin)
    ctx.page.drawRectangle({
      x: totalsLabelX - 8,
      y: ctx.y - 4,
      width: totalsRightEdge - (totalsLabelX - 8),
      height: 20,
      color: TABLE_HEADER_COLOR,
    });

    drawText(ctx, 'TOTAL', totalsLabelX, ctx.y + 3, 11, bold, rgb(1, 1, 1));
    drawTextRight(ctx, fmtMoney(totalDisplayCents), totalsRightEdge, ctx.y + 3, 13, bold, rgb(1, 1, 1));
    ctx.y -= 24;

    // ── TERMS / FOOTER ────────────────────────────────────────────────────────
    ctx.y -= SECTION_GAP + 4;
    drawRule(ctx, rgb(0.82, 0.82, 0.82), 0.5);

    drawLine(ctx, 'TÉRMINOS Y CONDICIONES', MARGIN, 7.5, bold, rgb(0.38, 0.38, 0.42));
    drawLine(
      ctx,
      'Pago procesado de forma segura. Gracias por tu compra en HTown Autos.',
      MARGIN,
      8,
      regular,
      rgb(0.35, 0.35, 0.40),
    );
    if (order.type === 'SERVICE') {
      drawLine(
        ctx,
        'El servicio Find a Car for Me no incluye fee de Copart, brokeraje ni envío.',
        MARGIN,
        8,
        regular,
        rgb(0.35, 0.35, 0.40),
      );
    }

    // ── Page footers ──────────────────────────────────────────────────────────
    for (let i = 0; i < ctx.pages.length; i++) {
      const pg = ctx.pages[i];
      const footerY = MARGIN / 2;
      pg.drawText(`${COMPANY.name}  ·  ${COMPANY.website}`, {
        x: MARGIN,
        y: footerY,
        size: 7.5,
        font: regular,
        color: rgb(0.62, 0.62, 0.65),
      });
      const rightText =
        ctx.pages.length > 1
          ? `Recibo ${receiptNumber}  ·  Pág. ${i + 1}/${ctx.pages.length}`
          : `Recibo ${receiptNumber}  ·  ${fmtDate(order.createdAt)}`;
      const rightW = regular.widthOfTextAtSize(rightText, 7.5);
      pg.drawText(rightText, {
        x: PAGE_WIDTH - MARGIN - rightW,
        y: footerY,
        size: 7.5,
        font: regular,
        color: rgb(0.62, 0.62, 0.65),
      });
    }

    return doc.save();
  }
}
