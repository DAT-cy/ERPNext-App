import { api } from "../config/api";

type IncomingRateResponse = { message?: number | string } | any;
type StockBalanceResponse = { message?: { qty?: number | string } } | any;

export async function getItemDetails(itemCode: string): Promise<any> {
    try {
        const response = await api.get(`/api/resource/Item/${itemCode}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

export async function getIncomingRate(
    itemCode: string,
    postingDate: string,
    postingTime: string,
    warehouse: string = ""
): Promise<IncomingRateResponse> {
    try {
        const args = {
            item_code: itemCode,
            posting_date: postingDate,
            posting_time: postingTime,
            warehouse: warehouse,
        };
        const response = await api.get('/api/method/erpnext.stock.utils.get_incoming_rate', {
            params: { args: JSON.stringify(args) }
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

export async function getStockBalance(
    itemCode: string,
    postingDate: string,
    postingTime: string,
    warehouse: string = ""
): Promise<StockBalanceResponse> {
    try {
        const form = new FormData();
        form.append('item_code', itemCode as any);
        form.append('warehouse', warehouse as any);
        form.append('posting_date', postingDate as any);
        form.append('posting_time', postingTime as any);
        const response = await api.post(
            '/api/method/erpnext.stock.doctype.stock_reconciliation.stock_reconciliation.get_stock_balance_for',
            form
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

