"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FEE_CONFIG = void 0;
exports.computeFinalPrice = computeFinalPrice;
exports.DEFAULT_FEE_CONFIG = {
    paymentMethod: 'secured',
    gateFee: 95,
    environmentalFee: 15,
    broker: { fixed: 0, pct: 0 },
    biddingFee: {
        rows: [
            { min: 0, max: 49.99, cs: 25, cu: 27.50, ns: 25, nu: 27.50 },
            { min: 50, max: 99.99, cs: 45, cu: 50, ns: 45, nu: 50 },
            { min: 100, max: 199.99, cs: 80, cu: 90, ns: 80, nu: 90 },
            { min: 200, max: 299.99, cs: 120, cu: 135, ns: 130, nu: 145 },
            { min: 300, max: 349.99, cs: 120, cu: 137.50, ns: 137.50, nu: 155 },
            { min: 350, max: 399.99, cs: 120, cu: 140, ns: 145, nu: 167.50 },
            { min: 400, max: 449.99, cs: 160, cu: 182.50, ns: 175, nu: 200 },
            { min: 450, max: 499.99, cs: 160, cu: 185, ns: 185, nu: 210 },
            { min: 500, max: 549.99, cs: 185, cu: 212.50, ns: 205, nu: 235 },
            { min: 550, max: 599.99, cs: 185, cu: 215, ns: 210, nu: 240 },
            { min: 600, max: 699.99, cs: 210, cu: 245, ns: 240, nu: 275 },
            { min: 700, max: 799.99, cs: 230, cu: 270, ns: 270, nu: 312.50 },
            { min: 800, max: 899.99, cs: 250, cu: 295, ns: 295, nu: 342.50 },
            { min: 900, max: 999.99, cs: 275, cu: 325, ns: 320, nu: 370 },
            { min: 1000, max: 1199.99, cs: 325, cu: 385, ns: 375, nu: 440 },
            { min: 1200, max: 1299.99, cs: 350, cu: 415, ns: 395, nu: 460 },
            { min: 1300, max: 1399.99, cs: 365, cu: 435, ns: 410, nu: 482.50 },
            { min: 1400, max: 1499.99, cs: 380, cu: 455, ns: 430, nu: 510 },
            { min: 1500, max: 1599.99, cs: 390, cu: 470, ns: 445, nu: 530 },
            { min: 1600, max: 1699.99, cs: 410, cu: 495, ns: 465, nu: 555 },
            { min: 1700, max: 1799.99, cs: 420, cu: 510, ns: 485, nu: 582.50 },
            { min: 1800, max: 1999.99, cs: 440, cu: 540, ns: 510, nu: 620 },
            { min: 2000, max: 2399.99, cs: 470, cu: 590, ns: 535, nu: 662.50 },
            { min: 2400, max: 2499.99, cs: 480, cu: 605, ns: 570, nu: 705 },
            { min: 2500, max: 2999.99, cs: 500, cu: 650, ns: 610, nu: 775 },
            { min: 3000, max: 3499.99, cs: 600, cu: 775, ns: 655, nu: 830 },
            { min: 3500, max: 3999.99, cs: 675, cu: 875, ns: 705, nu: 927.50 },
            { min: 4000, max: 4499.99, cs: 710, cu: 935, ns: 725, nu: 935 },
            { min: 4500, max: 4999.99, cs: 750, cu: 1000, ns: 750, nu: 1000 },
            { min: 5000, max: 5499.99, cs: 750, cu: 1000, ns: 775, nu: 1025 },
            { min: 5500, max: 5999.99, cs: 750, cu: 1000, ns: 800, nu: 1055 },
            { min: 6000, max: 6499.99, cs: 800, cu: 1050, ns: 825, nu: 1085 },
            { min: 6500, max: 6999.99, cs: 800, cu: 1050, ns: 845, nu: 1110 },
            { min: 7000, max: 7499.99, cs: 800, cu: 1050, ns: 880, nu: 1145 },
            { min: 7500, max: 7999.99, cs: 815, cu: 1065, ns: 900, nu: 1175 },
            { min: 8000, max: 8499.99, cs: 840, cu: 1090, ns: 925, nu: 1200 },
            { min: 8500, max: 8999.99, cs: 840, cu: 1090, ns: 945, nu: 1225 },
            { min: 9000, max: 9999.99, cs: 840, cu: 1090, ns: 945, nu: 1225 },
            { min: 10000, max: 10499.99, cs: 850, cu: 1200, ns: 1000, nu: 1390 },
            { min: 10500, max: 10999.99, cs: 850, cu: 1200, ns: 1000, nu: 1390 },
            { min: 11000, max: 11499.99, cs: 850, cu: 1200, ns: 1000, nu: 1390 },
            { min: 11500, max: 11999.99, cs: 850, cu: 1200, ns: 1000, nu: 1400 },
            { min: 12000, max: 12499.99, cs: 850, cu: 1200, ns: 1000, nu: 1400 },
            { min: 12500, max: 14999.99, cs: 850, cu: 1200, ns: 1000, nu: 1400 },
            { min: 15000, max: null, cs: '7.25%', cu: '12.25%', ns: '7.50%', nu: '12.50%' },
        ],
    },
};
function resolveFeeValue(value, highBid) {
    if (typeof value === 'number') {
        return value;
    }
    const pct = parseFloat(value.replace('%', ''));
    return Math.round(highBid * (pct / 100) * 100) / 100;
}
function lookupBiddingFee(highBid, titleType, paymentMethod, rows) {
    const col = titleType === 'clean'
        ? (paymentMethod === 'secured' ? 'cs' : 'cu')
        : (paymentMethod === 'secured' ? 'ns' : 'nu');
    for (const row of rows) {
        const inRange = highBid >= row.min && (row.max === null || highBid <= row.max);
        if (inRange) {
            return resolveFeeValue(row[col], highBid);
        }
    }
    return 0;
}
function computeFinalPrice(highBid, titleType, config, paymentMethod) {
    const method = paymentMethod ?? config.paymentMethod;
    const biddingFee = lookupBiddingFee(highBid, titleType, method, config.biddingFee.rows);
    const gateFee = config.gateFee;
    const environmentalFee = config.environmentalFee;
    const auctionFee = biddingFee + gateFee + environmentalFee;
    const brokerFee = Math.max(config.broker.fixed, Math.round(highBid * (config.broker.pct / 100) * 100) / 100);
    const finalPrice = highBid + auctionFee + brokerFee;
    return {
        highBid,
        biddingFee,
        gateFee,
        environmentalFee,
        auctionFee,
        brokerFee,
        finalPrice,
    };
}
//# sourceMappingURL=fee-config.default.js.map