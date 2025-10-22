export type DeliveryNote = {
    custom_id: string;
    custom_sales_invoice: string;
    posting_date: string;
    creation: string;
    customer: string;
    customer_name?: string;
    total_qty: string | number;
    workflow_state: string;
}

export type DeliveryNoteItem = {
    item_code?: string;
    item_name?: string;
    qty?: number | string;
    uom?: string;
    warehouse?: string;
    barcode?: string;
};

export type DeliveryNoteDetail = {
    name: string;
    customer?: string;
    customer_name?: string;
    posting_date?: string;
    creation?: string;
    workflow_state?: string;
    custom_reference_name?: string;
    custom_sales_invoice?: string;
    total_qty?: number | string;
    items?: DeliveryNoteItem[];
};