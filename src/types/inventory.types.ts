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

export type SaveInventoryRequest = {
    docstatus   : string;
    doctype: string;
    purpose: string;
    company: string;
    posting_date : string;
    posting_time : string;
    stock_entry_type: string;
    add_to_transit: string;
    custom_original_target_warehouse: string;
    from_warehouse: string;
    to_warehouse: string;
    custom_interpretation: string;
    items: StockEntryItem[];
}
export type StockEntryItem = {
    doctype: string;
    item_code: string;
    item_name: string;
    qty: number;
    s_warehouse: string;
    t_warehouse: string;
    basic_rate : number;
    stock_uom :string;
    uom :  string   ;
    expense_account:string;
}

export type SaveInventoryResponse = {
    data: {
        name: string;
    };
};