import { CommonException } from "@/utils/error/CommonException";
import { api } from "../config/api";
import { ErrorCode } from "@/utils/error/ErrorCode";
import { SaveInventoryRequest, SaveInventoryResponse } from "@/types/inventory.types";

type IncomingRateResponse = { message?: number | string } | any;
type StockBalanceResponse = { message?: { qty?: number | string } } | any;

export async function getItemDetails(itemCode: string): Promise<any> {
    try {
        const response = await api.get(`/api/resource/Item/${itemCode}`);
        return response.data;
    } catch (error: any) {
        throw new CommonException(ErrorCode.DETAIL_ITEM_NOT_FOUND);
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
        console.log('request getIncomingRate', args);
        return response.data;
    } catch (error: any) {
        throw new CommonException(ErrorCode.INCOMING_RATE_NOT_FOUND);
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
        console.log('request getStockBalance', form);
        const response = await api.post(
            '/api/method/erpnext.stock.doctype.stock_reconciliation.stock_reconciliation.get_stock_balance_for',
            form
        );
        return response.data;
    } catch (error: any) {
        throw new CommonException(ErrorCode.STOCK_BALANCE_NOT_FOUND);
    }
}

export async function saveInventory(payload: SaveInventoryRequest): Promise<SaveInventoryResponse> {
    try {
        const form = new FormData();
        form.append('data', JSON.stringify(payload));
        const response = await api.post('/api/resource/Stock Entry', form);
        return response.data;
    } catch (error: any) {
        throw new CommonException(ErrorCode.SAVE_INVENTORY_FAILED);
    }
}