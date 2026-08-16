export declare enum DealType {
    FINANCE = "finance",
    BHPH = "bhph",
    CASH = "cash",
    WHOLESALE = "wholesale",
    OUTSIDE_FINANCE = "outside_finance"
}
export declare class CreateDealDto {
    dealType: DealType;
    buyerId: string;
    vehicleId: string;
    coBuyerId?: string;
    dealStatusId?: string;
    financeTypeId?: string;
    dealDate?: string;
    deliveryDate?: string;
    vehiclePrice: number;
    sellingPrice: number;
    discount?: number;
    rebate?: number;
    salesTax?: number;
    docFee?: number;
    titleFee?: number;
    registrationFee?: number;
    otherFees?: number;
    downPayment?: number;
    apr?: number;
    term?: number;
    monthlyPayment?: number;
    totalOfPayments?: number;
    financeCharge?: number;
    lenderName?: string;
    lenderId?: string;
    lenderRate?: number;
    dealerReserve?: number;
    buyRate?: number;
    sellRate?: number;
    hasTradeIn?: boolean;
    tradeInYear?: number;
    tradeInMake?: string;
    tradeInModel?: string;
    tradeInVin?: string;
    tradeInMileage?: number;
    tradeInActualValue?: number;
    tradeInAllowance?: number;
    tradeInPayoff?: number;
    tradeInLienHolder?: string;
    hasWarranty?: boolean;
    warrantyProvider?: string;
    warrantyCost?: number;
    warrantyTerm?: number;
    warrantyDeductible?: number;
    hasGap?: boolean;
    gapProvider?: string;
    gapCost?: number;
    hasMaintenancePlan?: boolean;
    maintenanceProvider?: string;
    maintenanceCost?: number;
    hasTheftProtection?: boolean;
    theftProtectionCost?: number;
    hasPaintProtection?: boolean;
    paintProtectionCost?: number;
    creditCheckConsent?: boolean;
    creditScore?: number;
    salesPersonId?: string;
    salesManagerId?: string;
    financeManagerId?: string;
    notes?: string;
    internalNotes?: string;
}
