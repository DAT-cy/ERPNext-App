export type dataFill = {
    name: string;
}

// Chỉ những field đang được sử dụng trong form
export interface ItemDetails {
    item_code: string;
    item_name: string;
    stock_uom: string;
    last_purchase_rate: number;
    is_stock_item: number;
    opening_stock: number;
    description?: string;
    brand?: string;
    standard_rate?: number;
}