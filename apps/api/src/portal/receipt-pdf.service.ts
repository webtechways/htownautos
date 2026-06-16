import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import { Prisma } from '@prisma/client';
import { PortalService, OrderReceiptDetail } from './portal.service';
import { RECEIPT_LOGO_PNG_BASE64 } from './receipt-logo';

// ── Company constants ─────────────────────────────────────────────────────────
const COMPANY = {
  name: 'HTown Autos',
  addressLines: ['Houston, TX'],
  phone: '+1 (832) 308-8092',
  website: 'htownautos.com',
};

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_WIDTH = 612;   // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const LINE_H = 15;
const SECTION_GAP = 10;

// Logo sizing
const LOGO_MAX_W = 130;
const LOGO_MAX_H = 64;

// Table column geometry — generous description column so nothing truncates
const COL_QTY_X = MARGIN;
const COL_QTY_W = 28;
const COL_DESC_X = COL_QTY_X + COL_QTY_W + 8;
const COL_UNIT_W = 76;
const COL_AMT_W = 72;
const COL_AMT_X = PAGE_WIDTH - MARGIN - COL_AMT_W;
const COL_UNIT_X = COL_AMT_X - COL_UNIT_W - 6;
const COL_DESC_W = COL_UNIT_X - COL_DESC_X - 6;

// ── Palette — pure white, no fills ───────────────────────────────────────────
const C_BLACK   = rgb(0.067, 0.067, 0.067);   // #111
const C_GRAY    = rgb(0.40, 0.40, 0.40);       // #666
const C_LIGHT   = rgb(0.60, 0.60, 0.60);       // labels / secondary
const C_RULE    = rgb(0.80, 0.80, 0.80);       // #cccccc hairline

// ── Money helper ──────────────────────────────────────────────────────────────
function fmtMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: Date): string {
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

/**
 * De-duplicate model string.
 * "ALTIMA ALTIMA" → "ALTIMA"
 * "RAM 1500 1500" → "RAM 1500"
 * Works by checking whether the second word-group is already contained in the first.
 */
function dedupeModel(model: string | null | undefined): string {
  if (!model) return '';
  const parts = model.trim().split(/\s+/);
  if (parts.length <= 1) return model.trim();
  // Build the deduplicated sequence
  const result: string[] = [];
  for (const part of parts) {
    // Skip if this token already appears in the accumulated result (case-insensitive)
    const accumulated = result.join(' ').toUpperCase();
    if (!accumulated.includes(part.toUpperCase())) {
      result.push(part);
    }
  }
  return result.join(' ');
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
  color = C_BLACK,
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
  color = C_BLACK,
): void {
  ensureSpace(ctx, LINE_H * 3);
  ctx.page.drawText(text, { x, y: ctx.y, size: fontSize, font, color });
  ctx.y -= LINE_H;
}

/** Draw right-aligned text at a fixed right edge. Does NOT move ctx.y. */
function drawTextRight(
  ctx: Ctx,
  text: string,
  rightEdge: number,
  y: number,
  fontSize: number,
  font: PDFFont,
  color = C_BLACK,
): void {
  const w = font.widthOfTextAtSize(text, fontSize);
  ctx.page.drawText(text, { x: rightEdge - w, y, size: fontSize, font, color });
}

/** Truncate text to fit within maxWidth points (last resort only). */
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

/** Draw a full-width hairline rule and advance ctx.y by SECTION_GAP. */
function drawRule(ctx: Ctx, thickness = 0.5): void {
  ensureSpace(ctx, LINE_H * 2);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 3 },
    end:   { x: PAGE_WIDTH - MARGIN, y: ctx.y + 3 },
    thickness,
    color: C_RULE,
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
  /** Primary description text (black). */
  description: string;
  /** Optional second line rendered in gray/small below the primary text. */
  subline?: string;
  unitCents: number;
  amountCents: number;
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
          const yardLabel = yard.yardName ?? yard.yardId;

          for (const v of yard.vehicles) {
            // Primary line: "{year} {make} {model}" — model de-duped
            const yearMake = [v.year, v.make].filter(Boolean).join(' ');
            const modelClean = dedupeModel(v.model);
            const primaryDesc = [yearMake, modelClean].filter(Boolean).join(' ') || '—';

            // Sub-line: "VIN {vin} · {yardName}" or "Lote {lotNumber} · {yardName}"
            const identifier = v.vin
              ? `VIN ${v.vin}`
              : v.lotNumber
                ? `Lote ${v.lotNumber}`
                : null;
            const subline = [identifier, yardLabel].filter(Boolean).join(' · ');

            lineItems.push({
              qty: 1,
              description: primaryDesc,
              subline,
              unitCents: yard.inspectionFeeCents,
              amountCents: yard.inspectionFeeCents,
            });
          }

          // Travel fee row per yard — only when non-zero
          if (yard.travelFeeCents > 0) {
            lineItems.push({
              qty: 1,
              description: `Tarifa de traslado — ${yardLabel}`,
              unitCents: yard.travelFeeCents,
              amountCents: yard.travelFeeCents,
            });
          }
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
        const yearTo   = p['yearTo']   != null ? String(p['yearTo'])   : null;
        const yearRange =
          yearFrom && yearTo ? `${yearFrom}-${yearTo}` : yearFrom ?? yearTo ?? null;
        const parts = [p['make'], models.length ? models.join('/') : null, yearRange].filter(Boolean);
        if (parts.length) servicePreferences.push(parts.join(' '));
      }
    } else {
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
    const bold    = await doc.embedFont(StandardFonts.HelveticaBold);

    const firstPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const ctx: Ctx = {
      doc,
      page: firstPage,
      regular,
      bold,
      y: PAGE_HEIGHT - MARGIN,
      pages: [firstPage],
    };

    // ── HEADER: logo (left) + company block (right) ───────────────────────────
    // We'll track how tall the header area is so we can drop ctx.y below it.
    const headerTopY = ctx.y; // = PAGE_HEIGHT - MARGIN

    // Logo
    let logoH = 0;
    let logoW = 0;
    try {
      const logoBytes = Buffer.from(RECEIPT_LOGO_PNG_BASE64, 'base64');
      const logoImg   = await doc.embedPng(logoBytes);
      const logoNat   = logoImg.scale(1);
      const scale = Math.min(LOGO_MAX_W / logoNat.width, LOGO_MAX_H / logoNat.height, 1);
      logoW = logoNat.width  * scale;
      logoH = logoNat.height * scale;
      // Draw logo top-aligned with header top
      ctx.page.drawImage(logoImg, {
        x: MARGIN,
        y: headerTopY - logoH,
        width: logoW,
        height: logoH,
      });
    } catch {
      /* Logo embed failure is non-fatal */
    }

    // Company block — right-aligned
    const companyLines: Array<{ text: string; size: number; isBold: boolean }> = [
      { text: COMPANY.name,            size: 10, isBold: true  },
      ...COMPANY.addressLines.map(l => ({ text: l, size: 8, isBold: false })),
      { text: COMPANY.phone,           size: 8,  isBold: false },
      { text: COMPANY.website,         size: 8,  isBold: false },
    ];

    const COMPANY_RIGHT = PAGE_WIDTH - MARGIN;
    let companyY = headerTopY;
    for (const cl of companyLines) {
      const f = cl.isBold ? bold : regular;
      const color = cl.isBold ? C_BLACK : C_GRAY;
      const w = f.widthOfTextAtSize(cl.text, cl.size);
      ctx.page.drawText(cl.text, { x: COMPANY_RIGHT - w, y: companyY, size: cl.size, font: f, color });
      companyY -= cl.isBold ? 14 : 12;
    }

    // Move ctx.y below the taller of the two columns
    const companyBlockH = headerTopY - companyY;
    ctx.y = headerTopY - Math.max(logoH, companyBlockH) - 14;

    // ── TITLE: "RECIBO" ───────────────────────────────────────────────────────
    ensureSpace(ctx, 40);
    ctx.page.drawText('RECIBO', {
      x: MARGIN,
      y: ctx.y,
      size: 20,
      font: bold,
      color: C_BLACK,
    });
    ctx.y -= 26;

    // ── Hairline rule under title ─────────────────────────────────────────────
    drawRule(ctx);

    // ── BILL TO + META two-column band ───────────────────────────────────────
    const bandTopY = ctx.y;

    // Left: FACTURAR A
    drawText(ctx, 'FACTURAR A', MARGIN, bandTopY, 7.5, bold, C_LIGHT);
    drawText(ctx, opts.buyerName || '—', MARGIN, bandTopY - 14, 11, bold, C_BLACK);
    let billY = bandTopY - 27;
    if (opts.buyerEmail) {
      drawText(ctx, opts.buyerEmail, MARGIN, billY, 9, regular, C_GRAY);
      billY -= 13;
    }
    if (opts.buyerPhone) {
      drawText(ctx, opts.buyerPhone, MARGIN, billY, 9, regular, C_GRAY);
    }

    // Right: RECIBO # / FECHA / ESTADO
    const metaRows: Array<[string, string]> = [
      ['RECIBO #', receiptNumber],
      ['FECHA',    fmtDate(order.createdAt)],
      ['ESTADO',   fmtStatus(order.status)],
    ];
    // Labels right-aligned at a fixed point; values right-aligned at page right margin
    const META_LABEL_RIGHT = PAGE_WIDTH - MARGIN - 100;
    const META_VALUE_RIGHT = PAGE_WIDTH - MARGIN;
    let metaY = bandTopY;
    for (const [label, value] of metaRows) {
      drawTextRight(ctx, label, META_LABEL_RIGHT, metaY, 7.5, bold, C_LIGHT);
      drawTextRight(ctx, value, META_VALUE_RIGHT, metaY, 9, regular, C_BLACK);
      metaY -= 14;
    }

    // Advance ctx.y to below the band (both columns)
    const leftBottom  = opts.buyerPhone ? bandTopY - 53 : opts.buyerEmail ? bandTopY - 40 : bandTopY - 27;
    const rightBottom = metaY;
    ctx.y = Math.min(leftBottom, rightBottom) - SECTION_GAP;

    // ── Hairline rule under band ──────────────────────────────────────────────
    drawRule(ctx);

    // ── TABLE HEADER ROW (no fill) ────────────────────────────────────────────
    const TABLE_FS = 7.5;
    ensureSpace(ctx, LINE_H * 4);

    const tblHdrY = ctx.y;
    // Labels: CANT. (right-aligned in qty col), DESCRIPCIÓN, PRECIO UNIT. (right), IMPORTE (right)
    drawTextRight(ctx, 'CANT.',       COL_QTY_X + COL_QTY_W, tblHdrY, TABLE_FS, bold, C_BLACK);
    drawText(ctx,      'DESCRIPCIÓN', COL_DESC_X,             tblHdrY, TABLE_FS, bold, C_BLACK);
    drawTextRight(ctx, 'PRECIO UNIT.', COL_UNIT_X + COL_UNIT_W, tblHdrY, TABLE_FS, bold, C_BLACK);
    drawTextRight(ctx, 'IMPORTE',      COL_AMT_X  + COL_AMT_W,  tblHdrY, TABLE_FS, bold, C_BLACK);
    ctx.y -= LINE_H - 2;

    // Single hairline under header
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y + 4 },
      end:   { x: PAGE_WIDTH - MARGIN, y: ctx.y + 4 },
      thickness: 0.5,
      color: C_RULE,
    });
    ctx.y -= 6;

    // ── TABLE ROWS ────────────────────────────────────────────────────────────
    const ROW_FS   = 9;
    const SUB_FS   = 7.5;
    const ROW_LINE_H = LINE_H + 1;   // primary line height
    const SUB_LINE_H = 11;            // sub-line height

    for (const item of lineItems) {
      const rowH = ROW_LINE_H + (item.subline ? SUB_LINE_H : 0);
      ensureSpace(ctx, rowH + 8);

      const rowY = ctx.y;

      // QTY — right-aligned in qty column
      drawTextRight(ctx, String(item.qty), COL_QTY_X + COL_QTY_W, rowY, ROW_FS, regular, C_BLACK);

      // Description primary line — black
      const descPrimary = truncateText(item.description, bold, ROW_FS, COL_DESC_W);
      drawText(ctx, descPrimary, COL_DESC_X, rowY, ROW_FS, bold, C_BLACK);

      // Unit price and amount (right-aligned)
      drawTextRight(ctx, fmtMoney(item.unitCents),   COL_UNIT_X + COL_UNIT_W, rowY, ROW_FS, regular, C_BLACK);
      drawTextRight(ctx, fmtMoney(item.amountCents), COL_AMT_X  + COL_AMT_W,  rowY, ROW_FS, regular, C_BLACK);

      ctx.y -= ROW_LINE_H;

      // Sub-line (VIN / lot / yard) — gray, smaller
      if (item.subline) {
        ensureSpace(ctx, SUB_LINE_H + 4);
        const subTrunc = truncateText(item.subline, regular, SUB_FS, COL_DESC_W + COL_UNIT_W + COL_AMT_W + 12);
        drawText(ctx, subTrunc, COL_DESC_X, ctx.y, SUB_FS, regular, C_GRAY);
        ctx.y -= SUB_LINE_H;
      }

      // Light hairline between rows
      ctx.page.drawLine({
        start: { x: MARGIN, y: ctx.y + 4 },
        end:   { x: PAGE_WIDTH - MARGIN, y: ctx.y + 4 },
        thickness: 0.3,
        color: C_RULE,
      });
      ctx.y -= 4;
    }

    // ── SERVICE extra notes ───────────────────────────────────────────────────
    if (serviceNote) {
      ctx.y -= 4;
      ensureSpace(ctx, LINE_H * 5);

      if (servicePreferences.length) {
        drawLine(ctx, 'Preferencias de vehículo:', COL_DESC_X, 7.5, bold, C_GRAY);
        for (const pref of servicePreferences) {
          drawLine(ctx, `  · ${pref}`, COL_DESC_X, 8, regular, C_GRAY);
        }
      }

      ctx.y -= 2;
      const sentences = serviceNote.split(/(?<=\.) /);
      for (const sentence of sentences) {
        drawLine(ctx, sentence.trim(), COL_DESC_X, 7.5, regular, C_GRAY);
      }
    }

    // ── TOTALS block ──────────────────────────────────────────────────────────
    ctx.y -= SECTION_GAP;
    drawRule(ctx);

    const totalsLabelX   = COL_UNIT_X;
    const totalsRightEdge = PAGE_WIDTH - MARGIN;

    if (order.type === 'INSPECTION' && detail) {
      ensureSpace(ctx, LINE_H * 4 + 10);
      const subtotalRows: Array<[string, number]> = [
        ['Subtotal inspecciones', detail.inspectionSubtotalCents],
        ['Subtotal traslados',    detail.travelSubtotalCents],
        ['Impuestos',             0],
      ];
      for (const [label, cents] of subtotalRows) {
        const rowY = ctx.y;
        drawText(ctx,      label,            totalsLabelX,  rowY, 8.5, regular, C_GRAY);
        drawTextRight(ctx, fmtMoney(cents),  totalsRightEdge, rowY, 8.5, regular, C_GRAY);
        ctx.y -= LINE_H;
      }
    } else if (order.type !== 'SERVICE') {
      // DEPOSIT — show subtotal + taxes
      ensureSpace(ctx, LINE_H * 2 + 10);
      const subY = ctx.y;
      drawText(ctx,      'Subtotal',      totalsLabelX,  subY, 8.5, regular, C_GRAY);
      drawTextRight(ctx, fmtMoney(totalCents), totalsRightEdge, subY, 8.5, regular, C_GRAY);
      ctx.y -= LINE_H;
      const taxY = ctx.y;
      drawText(ctx,      'Impuestos',  totalsLabelX, taxY, 8.5, regular, C_GRAY);
      drawTextRight(ctx, '$0.00', totalsRightEdge, taxY, 8.5, regular, C_GRAY);
      ctx.y -= LINE_H;
    }

    // Total line — hairline then bold larger text, NO fill
    ctx.y -= 4;
    drawRule(ctx, 0.6);
    ensureSpace(ctx, 24);

    const totalDisplayCents =
      order.type === 'INSPECTION' && detail ? detail.totalCents : totalCents;

    const totalY = ctx.y;
    drawText(ctx,      'TOTAL',                        totalsLabelX,    totalY, 12, bold, C_BLACK);
    drawTextRight(ctx, fmtMoney(totalDisplayCents),    totalsRightEdge, totalY, 14, bold, C_BLACK);
    ctx.y -= 26;

    // ── TERMS / FOOTER ────────────────────────────────────────────────────────
    ctx.y -= SECTION_GAP + 4;
    drawRule(ctx, 0.5);

    drawLine(ctx, 'TÉRMINOS Y CONDICIONES', MARGIN, 7.5, bold, C_LIGHT);
    drawLine(
      ctx,
      'Pago procesado de forma segura. Gracias por tu compra en HTown Autos.',
      MARGIN, 8, regular, C_GRAY,
    );
    if (order.type === 'SERVICE') {
      drawLine(
        ctx,
        'El servicio Find a Car for Me no incluye fee de Copart, brokeraje ni envío.',
        MARGIN, 8, regular, C_GRAY,
      );
    }

    // ── Page footers ──────────────────────────────────────────────────────────
    for (let i = 0; i < ctx.pages.length; i++) {
      const pg      = ctx.pages[i];
      const footerY = MARGIN / 2;
      pg.drawText(`${COMPANY.name}  ·  ${COMPANY.website}`, {
        x: MARGIN,
        y: footerY,
        size: 7.5,
        font: regular,
        color: C_LIGHT,
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
        color: C_LIGHT,
      });
    }

    return doc.save();
  }
}
