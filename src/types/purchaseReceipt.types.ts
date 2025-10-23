export type PurchaseReceipt = {
    name: string;
    posting_date: string;
    supplier_name?: string;
    total_qty: string | number;
    workflow_state: string;
    creation?: string;
    supplier?: string;
}

export type PurchaseReceiptItem = {
    item_code?: string;
    item_name?: string;
    qty?: number | string;
    uom?: string;
    warehouse?: string;
    barcode?: string;
};

export type PurchaseReceiptDetail = {
    name: string;
    supplier?: string;
    supplier_name?: string;
    posting_date?: string;
    creation?: string;
    workflow_state?: string;
    total_qty?: number | string;
    items?: PurchaseReceiptItem[];
};
