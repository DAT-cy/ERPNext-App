import { api } from "../config/api";
import { CommonException, ErrorCode } from "../utils/error";

export interface InventoryDetailData {
    name: string;
    stock_entry_type: string;
    workflow_state: string;
    from_warehouse: string;
    custom_original_target_warehouse: string;
    expense_account: string;
    docstatus: number;
    creation: string;
    purpose: string;
    custom_interpretation: string;
    owner: string;
    items?: InventoryDetailItem[];
}

export interface InventoryDetailItem {
    item_code: string;
    item_name: string;
    qty: number;
    uom: string;
    basic_rate: number;
    amount: number;
    is_finished_item: boolean;
    description?: string;
}

export interface InventoryDetailResult {
    success: boolean;
    data?: InventoryDetailData;
    error?: CommonException;
}

export async function getInventoryDetail(name: string): Promise<InventoryDetailResult> {
    try {
        console.log('🔍 [getInventoryDetail] Fetching detail for:', name);
        
        const response = await api.get(`/api/resource/Stock Entry/${name}`);
        
        console.log('📥 [getInventoryDetail] Response received:', {
            status: 'success',
            data: response.data?.data
        });
        
        if (response.data && response.data.data) {
            return {
                success: true,
                data: response.data.data as InventoryDetailData
            };
        }
        
        console.log('❌ [getInventoryDetail] No data found in response:', response.data);
        
        return {
            success: false,
            error: new CommonException(ErrorCode.ENTITY_NOT_FOUND, 'Không tìm thấy chi tiết phiếu nhập xuất')
        };
        
    } catch (error: any) {
        console.log('💥 [getInventoryDetail] Error occurred:', {
            error: error,
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status
        });
        
        return {
            success: false,
            error: new CommonException(ErrorCode.NETWORK_ERROR, error?.message || 'Có lỗi xảy ra khi tải chi tiết')
        };
    }
}