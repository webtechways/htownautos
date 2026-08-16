"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptPdfService = void 0;
const common_1 = require("@nestjs/common");
const pdf_lib_1 = require("pdf-lib");
const portal_service_1 = require("./portal.service");
const receipt_logo_1 = require("./receipt-logo");
const COMPANY = {
    name: 'HTown Autos',
    addressLines: ['Houston, TX'],
    phone: '+1 (832) 308-8092',
    website: 'htownautos.com',
};
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const LINE_H = 15;
const SECTION_GAP = 10;
const LOGO_MAX_W = 130;
const LOGO_MAX_H = 64;
const COL_QTY_X = MARGIN;
const COL_QTY_W = 28;
const COL_DESC_X = COL_QTY_X + COL_QTY_W + 8;
const COL_UNIT_W = 76;
const COL_AMT_W = 72;
const COL_AMT_X = PAGE_WIDTH - MARGIN - COL_AMT_W;
const COL_UNIT_X = COL_AMT_X - COL_UNIT_W - 6;
const COL_DESC_W = COL_UNIT_X - COL_DESC_X - 6;
const C_BLACK = (0, pdf_lib_1.rgb)(0.067, 0.067, 0.067);
const C_GRAY = (0, pdf_lib_1.rgb)(0.40, 0.40, 0.40);
const C_LIGHT = (0, pdf_lib_1.rgb)(0.60, 0.60, 0.60);
const C_RULE = (0, pdf_lib_1.rgb)(0.80, 0.80, 0.80);
function fmtMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
}
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(d) {
    const month = MONTH_ABBR[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
}
function fmtStatus(status) {
    const map = {
        PAID: 'Paid',
        FULFILLED: 'Completed',
        PENDING: 'Pending',
        CANCELED: 'Canceled',
        REFUNDED: 'Refunded',
    };
    return map[status] ?? status;
}
function dedupeModel(model) {
    if (!model)
        return '';
    const parts = model.trim().split(/\s+/);
    if (parts.length <= 1)
        return model.trim();
    const result = [];
    for (const part of parts) {
        const accumulated = result.join(' ').toUpperCase();
        if (!accumulated.includes(part.toUpperCase())) {
            result.push(part);
        }
    }
    return result.join(' ');
}
function addPage(ctx) {
    const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    ctx.pages.push(page);
    ctx.page = page;
    ctx.y = PAGE_HEIGHT - MARGIN;
}
function ensureSpace(ctx, needed = LINE_H * 3) {
    if (ctx.y < MARGIN + needed)
        addPage(ctx);
}
function drawText(ctx, text, x, y, fontSize, font, color = C_BLACK) {
    ctx.page.drawText(text, { x, y, size: fontSize, font, color });
}
function drawLine(ctx, text, x, fontSize, font, color = C_BLACK) {
    ensureSpace(ctx, LINE_H * 3);
    ctx.page.drawText(text, { x, y: ctx.y, size: fontSize, font, color });
    ctx.y -= LINE_H;
}
function drawTextRight(ctx, text, rightEdge, y, fontSize, font, color = C_BLACK) {
    const w = font.widthOfTextAtSize(text, fontSize);
    ctx.page.drawText(text, { x: rightEdge - w, y, size: fontSize, font, color });
}
function truncateText(text, font, fontSize, maxWidth) {
    if (font.widthOfTextAtSize(text, fontSize) <= maxWidth)
        return text;
    let truncated = text;
    while (truncated.length > 1 && font.widthOfTextAtSize(truncated + '…', fontSize) > maxWidth) {
        truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
}
function drawRule(ctx, thickness = 0.5) {
    ensureSpace(ctx, LINE_H * 2);
    ctx.page.drawLine({
        start: { x: MARGIN, y: ctx.y + 3 },
        end: { x: PAGE_WIDTH - MARGIN, y: ctx.y + 3 },
        thickness,
        color: C_RULE,
    });
    ctx.y -= SECTION_GAP;
}
let ReceiptPdfService = class ReceiptPdfService {
    portalService;
    constructor(portalService) {
        this.portalService = portalService;
    }
    async buildOrderReceiptPdf(order, opts) {
        const receiptNumber = order.id.slice(0, 8).toUpperCase();
        const totalCents = Math.round(Number(order.amount) * 100);
        const meta = (order.metadata ?? {});
        const lineItems = [];
        let serviceNote = null;
        let servicePreferences = [];
        let detail = null;
        if (order.type === 'INSPECTION') {
            detail = await this.portalService.buildOrderReceiptDetail(order);
            if (detail) {
                for (const yard of detail.byYard) {
                    const yardLabel = yard.yardName ?? yard.yardId;
                    for (const v of yard.vehicles) {
                        const yearMake = [v.year, v.make].filter(Boolean).join(' ');
                        const modelClean = dedupeModel(v.model);
                        const primaryDesc = [yearMake, modelClean].filter(Boolean).join(' ') || '—';
                        const identifier = v.vin
                            ? `VIN ${v.vin}`
                            : v.lotNumber
                                ? `Lot ${v.lotNumber}`
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
                    if (yard.travelFeeCents > 0) {
                        lineItems.push({
                            qty: 1,
                            description: `Travel fee — ${yardLabel}`,
                            unitCents: yard.travelFeeCents,
                            amountCents: yard.travelFeeCents,
                        });
                    }
                }
            }
        }
        else if (order.type === 'DEPOSIT') {
            lineItems.push({
                qty: 1,
                description: 'Account deposit',
                unitCents: totalCents,
                amountCents: totalCents,
            });
        }
        else if (order.type === 'SERVICE') {
            lineItems.push({
                qty: 1,
                description: 'Find a Car for Me — service',
                unitCents: totalCents,
                amountCents: totalCents,
            });
            serviceNote =
                'Includes: on-site inspection of 6 vehicles matching your requirements, Carfax for those 6, ' +
                    'history search, bidding on each until one is won, and shipping handling. ' +
                    'Does not include: Copart fees, brokerage fees, or shipping fees.';
            const prefs = Array.isArray(meta['preferences']) ? meta['preferences'] : [];
            for (const p of prefs) {
                const models = Array.isArray(p['models']) ? p['models'] : [];
                const yearFrom = p['yearFrom'] != null ? String(p['yearFrom']) : null;
                const yearTo = p['yearTo'] != null ? String(p['yearTo']) : null;
                const yearRange = yearFrom && yearTo ? `${yearFrom}-${yearTo}` : yearFrom ?? yearTo ?? null;
                const parts = [p['make'], models.length ? models.join('/') : null, yearRange].filter(Boolean);
                if (parts.length)
                    servicePreferences.push(parts.join(' '));
            }
        }
        else {
            lineItems.push({
                qty: 1,
                description: order.description ?? 'Service',
                unitCents: totalCents,
                amountCents: totalCents,
            });
        }
        const doc = await pdf_lib_1.PDFDocument.create();
        const regular = await doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const bold = await doc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const firstPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        const ctx = {
            doc,
            page: firstPage,
            regular,
            bold,
            y: PAGE_HEIGHT - MARGIN,
            pages: [firstPage],
        };
        const headerTopY = ctx.y;
        let logoH = 0;
        let logoW = 0;
        try {
            const logoBytes = Buffer.from(receipt_logo_1.RECEIPT_LOGO_PNG_BASE64, 'base64');
            const logoImg = await doc.embedPng(logoBytes);
            const logoNat = logoImg.scale(1);
            const scale = Math.min(LOGO_MAX_W / logoNat.width, LOGO_MAX_H / logoNat.height, 1);
            logoW = logoNat.width * scale;
            logoH = logoNat.height * scale;
            ctx.page.drawImage(logoImg, {
                x: MARGIN,
                y: headerTopY - logoH,
                width: logoW,
                height: logoH,
            });
        }
        catch {
        }
        const companyLines = [
            { text: COMPANY.name, size: 10, isBold: true },
            ...COMPANY.addressLines.map(l => ({ text: l, size: 8, isBold: false })),
            { text: COMPANY.phone, size: 8, isBold: false },
            { text: COMPANY.website, size: 8, isBold: false },
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
        const companyBlockH = headerTopY - companyY;
        ctx.y = headerTopY - Math.max(logoH, companyBlockH) - 14;
        ensureSpace(ctx, 40);
        ctx.page.drawText('RECEIPT', {
            x: MARGIN,
            y: ctx.y,
            size: 20,
            font: bold,
            color: C_BLACK,
        });
        ctx.y -= 26;
        drawRule(ctx);
        const bandTopY = ctx.y;
        drawText(ctx, 'BILL TO', MARGIN, bandTopY, 7.5, bold, C_LIGHT);
        drawText(ctx, opts.buyerName || '—', MARGIN, bandTopY - 14, 11, bold, C_BLACK);
        let billY = bandTopY - 27;
        if (opts.buyerEmail) {
            drawText(ctx, opts.buyerEmail, MARGIN, billY, 9, regular, C_GRAY);
            billY -= 13;
        }
        if (opts.buyerPhone) {
            drawText(ctx, opts.buyerPhone, MARGIN, billY, 9, regular, C_GRAY);
        }
        const metaRows = [
            ['RECEIPT #', receiptNumber],
            ['DATE', fmtDate(order.createdAt)],
            ['STATUS', fmtStatus(order.status)],
        ];
        const META_LABEL_RIGHT = PAGE_WIDTH - MARGIN - 100;
        const META_VALUE_RIGHT = PAGE_WIDTH - MARGIN;
        let metaY = bandTopY;
        for (const [label, value] of metaRows) {
            drawTextRight(ctx, label, META_LABEL_RIGHT, metaY, 7.5, bold, C_LIGHT);
            drawTextRight(ctx, value, META_VALUE_RIGHT, metaY, 9, regular, C_BLACK);
            metaY -= 14;
        }
        const leftBottom = opts.buyerPhone ? bandTopY - 53 : opts.buyerEmail ? bandTopY - 40 : bandTopY - 27;
        const rightBottom = metaY;
        ctx.y = Math.min(leftBottom, rightBottom) - SECTION_GAP;
        drawRule(ctx);
        const TABLE_FS = 7.5;
        ensureSpace(ctx, LINE_H * 4);
        const tblHdrY = ctx.y;
        drawTextRight(ctx, 'QTY', COL_QTY_X + COL_QTY_W, tblHdrY, TABLE_FS, bold, C_BLACK);
        drawText(ctx, 'DESCRIPTION', COL_DESC_X, tblHdrY, TABLE_FS, bold, C_BLACK);
        drawTextRight(ctx, 'UNIT PRICE', COL_UNIT_X + COL_UNIT_W, tblHdrY, TABLE_FS, bold, C_BLACK);
        drawTextRight(ctx, 'AMOUNT', COL_AMT_X + COL_AMT_W, tblHdrY, TABLE_FS, bold, C_BLACK);
        ctx.y -= LINE_H - 2;
        ctx.page.drawLine({
            start: { x: MARGIN, y: ctx.y + 4 },
            end: { x: PAGE_WIDTH - MARGIN, y: ctx.y + 4 },
            thickness: 0.5,
            color: C_RULE,
        });
        ctx.y -= 6;
        const ROW_FS = 9;
        const SUB_FS = 7.5;
        const ROW_LINE_H = LINE_H + 1;
        const SUB_LINE_H = 11;
        for (const item of lineItems) {
            const rowH = ROW_LINE_H + (item.subline ? SUB_LINE_H : 0);
            ensureSpace(ctx, rowH + 8);
            const rowY = ctx.y;
            drawTextRight(ctx, String(item.qty), COL_QTY_X + COL_QTY_W, rowY, ROW_FS, regular, C_BLACK);
            const descPrimary = truncateText(item.description, bold, ROW_FS, COL_DESC_W);
            drawText(ctx, descPrimary, COL_DESC_X, rowY, ROW_FS, bold, C_BLACK);
            drawTextRight(ctx, fmtMoney(item.unitCents), COL_UNIT_X + COL_UNIT_W, rowY, ROW_FS, regular, C_BLACK);
            drawTextRight(ctx, fmtMoney(item.amountCents), COL_AMT_X + COL_AMT_W, rowY, ROW_FS, regular, C_BLACK);
            ctx.y -= ROW_LINE_H;
            if (item.subline) {
                ensureSpace(ctx, SUB_LINE_H + 4);
                const subTrunc = truncateText(item.subline, regular, SUB_FS, COL_DESC_W + COL_UNIT_W + COL_AMT_W + 12);
                drawText(ctx, subTrunc, COL_DESC_X, ctx.y, SUB_FS, regular, C_GRAY);
                ctx.y -= SUB_LINE_H;
            }
            ctx.page.drawLine({
                start: { x: MARGIN, y: ctx.y + 4 },
                end: { x: PAGE_WIDTH - MARGIN, y: ctx.y + 4 },
                thickness: 0.3,
                color: C_RULE,
            });
            ctx.y -= 4;
        }
        if (serviceNote) {
            ctx.y -= 4;
            ensureSpace(ctx, LINE_H * 5);
            if (servicePreferences.length) {
                drawLine(ctx, 'Vehicle preferences:', COL_DESC_X, 7.5, bold, C_GRAY);
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
        ctx.y -= SECTION_GAP;
        drawRule(ctx);
        const totalsLabelX = COL_UNIT_X;
        const totalsRightEdge = PAGE_WIDTH - MARGIN;
        if (order.type === 'INSPECTION' && detail) {
            ensureSpace(ctx, LINE_H * 4 + 10);
            const subtotalRows = [
                ['Inspections subtotal', detail.inspectionSubtotalCents],
                ['Travel subtotal', detail.travelSubtotalCents],
                ['Tax', 0],
            ];
            for (const [label, cents] of subtotalRows) {
                const rowY = ctx.y;
                drawText(ctx, label, totalsLabelX, rowY, 8.5, regular, C_GRAY);
                drawTextRight(ctx, fmtMoney(cents), totalsRightEdge, rowY, 8.5, regular, C_GRAY);
                ctx.y -= LINE_H;
            }
        }
        else if (order.type !== 'SERVICE') {
            ensureSpace(ctx, LINE_H * 2 + 10);
            const subY = ctx.y;
            drawText(ctx, 'Subtotal', totalsLabelX, subY, 8.5, regular, C_GRAY);
            drawTextRight(ctx, fmtMoney(totalCents), totalsRightEdge, subY, 8.5, regular, C_GRAY);
            ctx.y -= LINE_H;
            const taxY = ctx.y;
            drawText(ctx, 'Tax', totalsLabelX, taxY, 8.5, regular, C_GRAY);
            drawTextRight(ctx, '$0.00', totalsRightEdge, taxY, 8.5, regular, C_GRAY);
            ctx.y -= LINE_H;
        }
        ctx.y -= 4;
        drawRule(ctx, 0.6);
        ensureSpace(ctx, 24);
        const totalDisplayCents = order.type === 'INSPECTION' && detail ? detail.totalCents : totalCents;
        const totalY = ctx.y;
        drawText(ctx, 'TOTAL', totalsLabelX, totalY, 12, bold, C_BLACK);
        drawTextRight(ctx, fmtMoney(totalDisplayCents), totalsRightEdge, totalY, 14, bold, C_BLACK);
        ctx.y -= 26;
        ctx.y -= SECTION_GAP + 4;
        drawRule(ctx, 0.5);
        drawLine(ctx, 'TERMS & CONDITIONS', MARGIN, 7.5, bold, C_LIGHT);
        drawLine(ctx, 'Payment processed securely. Thank you for your purchase at HTown Autos.', MARGIN, 8, regular, C_GRAY);
        if (order.type === 'SERVICE') {
            drawLine(ctx, 'The Find a Car for Me service does not include Copart fees, brokerage fees, or shipping fees.', MARGIN, 8, regular, C_GRAY);
        }
        for (let i = 0; i < ctx.pages.length; i++) {
            const pg = ctx.pages[i];
            const footerY = MARGIN / 2;
            pg.drawText(`${COMPANY.name}  ·  ${COMPANY.website}`, {
                x: MARGIN,
                y: footerY,
                size: 7.5,
                font: regular,
                color: C_LIGHT,
            });
            const rightText = ctx.pages.length > 1
                ? `Receipt ${receiptNumber}  ·  Page ${i + 1}/${ctx.pages.length}`
                : `Receipt ${receiptNumber}  ·  ${fmtDate(order.createdAt)}`;
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
};
exports.ReceiptPdfService = ReceiptPdfService;
exports.ReceiptPdfService = ReceiptPdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [portal_service_1.PortalService])
], ReceiptPdfService);
//# sourceMappingURL=receipt-pdf.service.js.map