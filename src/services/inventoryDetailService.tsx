import { api } from "../config/api";
import { UpdateStockEntryPayload } from "../types/inventory.types";
import { handleServiceError, handleServiceThrow } from "../utils/error/ErrorHandler";

// ===== INTERFACES =====
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
    error?: string; // Vietnamese error message
}

export interface UpdateStockEntryResult {
    success: boolean;
    data?: InventoryDetailData;
    error?: string; // Vietnamese error message
}

// ===== API FUNCTIONS =====

/**
 * Lấy chi tiết phiếu nhập xuất kho
 */
export async function getInventoryDetail(name: string): Promise<InventoryDetailResult> {
    try {
        console.log('🔍 [getInventoryDetail] Fetching detail for:', name);
        
        const response = await api.get(`/api/resource/Stock Entry/${name}`);
        
        if (response?.data?.data) {
            console.log('✅ [getInventoryDetail] Success');
            return {
                success: true,
                data: response.data.data as InventoryDetailData
            };
        }
        
        console.log('❌ [getInventoryDetail] No data found');
        return {
            success: false,
            error: 'Không tìm thấy chi tiết phiếu nhập xuất'
        };
        
    } catch (error: any) {
        console.log('💥 [getInventoryDetail] Error:', error?.message);
        return handleServiceError(error, 'Lỗi tải chi tiết phiếu nhập xuất');
    }
}

/**
 * Cập nhật phiếu nhập xuất kho (items + trạng thái + description)
 * Chỉ gửi các trường thay đổi lên server
 */
export async function updateStockEntry(
    name: string, 
    currentData: InventoryDetailData, 
    newData: UpdateStockEntryPayload
): Promise<UpdateStockEntryResult> {
    try {
        const payload = buildUpdatePayload(currentData, newData);
        if (Object.keys(payload).length === 0) {
            return { 
                success: true, 
                data: currentData
            };
        }
        
        console.log('🔄 [updateStockEntry] Updating with payload:', payload);
        
        const response = await api.put(`/api/resource/Stock Entry/${encodeURIComponent(name)}`, payload);
        
        if (response?.data?.data) {
            console.log('✅ [updateStockEntry] Success');
            return {
                success: true,
                data: response.data.data as InventoryDetailData
            };
        }
        
        return {
            success: false,
            error: 'Không nhận được dữ liệu sau khi cập nhật'
        };
        
    } catch (error: any) {
        console.log('💥 [updateStockEntry] Error:', error?.message);
        return handleServiceError(error, 'Lỗi cập nhật phiếu nhập xuất');
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * Xây dựng payload chỉ chứa các trường thay đổi
 */
function buildUpdatePayload(currentData: InventoryDetailData, newData: UpdateStockEntryPayload): any {
    const payload: any = {};
    
    // Kiểm tra custom_interpretation
    if (newData.custom_interpretation && 
        newData.custom_interpretation !== currentData.custom_interpretation) {
        payload.custom_interpretation = newData.custom_interpretation;
    }
    
    // Kiểm tra workflow_state
    if (newData.workflow_state && 
        newData.workflow_state !== currentData.workflow_state &&
        newData.workflow_state.trim() !== '') {
        payload.workflow_state = newData.workflow_state;
    }
    
    // Kiểm tra items
    if (newData.items && newData.items.length > 0) {
        payload.items = newData.items;
    }
    
    return payload;
}

/**
 * Xóa phiếu nhập xuất kho
 */
export async function deleteStockEntry(name: string): Promise<{success: boolean, error?: string}> {
    try {
        console.log('🗑️ [deleteStockEntry] Deleting:', name);
        
        const response = await api.delete(`/api/resource/Stock Entry/${encodeURIComponent(name)}`);
        
        console.log('✅ [deleteStockEntry] Success');
        return { success: true };
        
    } catch (error: any) {
        console.log('💥 [deleteStockEntry] Error:', error?.message);
        return handleServiceError(error, 'Lỗi xóa phiếu nhập xuất');
    }
}