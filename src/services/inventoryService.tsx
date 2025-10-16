import { api } from "../config/api";
import { getEmployeeCodeByEmail } from "./authService";
import { CommonException, ErrorCode, ApplicationLeaveResult, ApplicationLeaveErrorCode, ApplicationLeaveErrorHandler } from "../utils/error";
import { dataFill } from "../types/inventory.types";


export type InventoryItem = {
    stock_entry_type: string;
    workflow_state: string;  
    from_warehouse: string;
    custom_original_target_warehouse: string;
    expense_account: string;
    docstatus: string | number;
    creation: string;
    purpose: string;
    custom_interpretation?: string;
    name: string;
    owner: string;
}

// Interface cho filter options
export interface InventoryFilters {
    name?: string;
    stock_entry_type?: string;
    workflow_state?: string;
    from_warehouse?: string;
    custom_original_target_warehouse?: string;
    expense_account?: string;
    docstatus?: string | number;
    creation?: string;
    purpose?: string;
    custom_interpretation?: string;
}

// Interface cho query options
export interface InventoryQueryOptions {
    fields?: string[];
    filters?: InventoryFilters;
    limit?: number;
    offset?: number;
    orderBy?: string;
}

// Map Vietnamese stock entry types to English canonical names used by backend
function toEnglishStockEntryType(value: string): string {
    const map: Record<string, string> = {
        // Common core types
        'Chuyển kho': 'Material Transfer',
        'Nhập kho': 'Material Receipt',
        'Xuất kho': 'Material Issue',
        'Sản xuất': 'Manufacture',
        'Trả hàng': 'Material Return',
        'Kiểm kê': 'Repack',
        // Extended types seen in your dataset
        'Xuất vật tư': 'Material Issue',
        'Nhập vật tư': 'Material Receipt',
        'Đóng gói': 'Repack',
        'Gửi nhà thầu phụ': 'Send to Subcontractor',
        'Chuyển vật tư cho sản xuất': 'Material Transfer for Manufacture',
        'Tiêu hao vật tư cho sản xuất': 'Material Consumption for Manufacture',
    };
    return map[value] || value;
}

// Hàm helper để build filters array
function buildFiltersArray(filters: InventoryFilters): string[][] {
    const filterArray: string[][] = [];
    
    if (filters.name) {
        // Check if the name filter contains wildcards for partial search
        if (filters.name.includes('%')) {
            filterArray.push(["name", "like", filters.name]);
        } else {
            filterArray.push(["name", "=", filters.name]);
        }
    }

    // Filter theo stock_entry_type (convert VN -> EN canonical for backend)
    if (filters.stock_entry_type) {
        const canonical = toEnglishStockEntryType(filters.stock_entry_type);
        filterArray.push(["stock_entry_type", "=", canonical]);
    }
    
    // Filter theo workflow_state
    if (filters.workflow_state) {
        filterArray.push(["workflow_state", "=", filters.workflow_state]);
    }
    
    // Filter theo from_warehouse
    if (filters.from_warehouse) {
        filterArray.push(["from_warehouse", "=", filters.from_warehouse]);
    }
    
    // Filter theo custom_original_target_warehouse
    if (filters.custom_original_target_warehouse) {
        filterArray.push(["custom_original_target_warehouse", "=", filters.custom_original_target_warehouse]);
    }
    
    // Filter theo expense_account
    if (filters.expense_account) {
        filterArray.push(["expense_account", "=", filters.expense_account]);
    }
    
    // Filter theo docstatus
    if (filters.docstatus !== undefined) {
        filterArray.push(["docstatus", "=", String(filters.docstatus)]);
    }
    
    // Filter theo creation date range - expect Frappe filter format
    if (filters.creation) {
        // Process creation date filter in Frappe format
        try {
            // Parse Frappe filter format: [["creation", ">=", "2025-10-10 00:00:00"], ["creation", "<=", "2025-10-10 23:59:59"]]
            const frappeFilters = JSON.parse(filters.creation);
            
            if (Array.isArray(frappeFilters)) {
                // Add all filters from the array
                frappeFilters.forEach((filter, index) => {
                    if (Array.isArray(filter) && filter.length === 3) {
                        filterArray.push(filter);
                    }
                });
            }
        } catch (error) {
            // ignore parse error
        }
    }
    
    // Filter theo purpose
    if (filters.purpose) {
        filterArray.push(["purpose", "=", filters.purpose]);
    }
    
    // Filter theo custom_interpretation
    if (filters.custom_interpretation) {
        filterArray.push(["custom_interpretation", "=", filters.custom_interpretation]);
    }
    
    return filterArray;
}

export async function getAllInventory(options: InventoryQueryOptions = {}): Promise<ApplicationLeaveResult<InventoryItem[]>> {
    try {
        
        const defaultFields = [
            "stock_entry_type",
            "workflow_state", 
            "from_warehouse",
            "custom_original_target_warehouse",
            "expense_account",
            "docstatus",
            "creation",
            "purpose",
            "custom_interpretation",
            "name",
            "owner"
        ];
        
        const fields = options.fields || defaultFields;
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('fields', JSON.stringify(fields));
        queryParams.append('limit_page_length', limit.toString());
        queryParams.append('limit_start', offset.toString());
        queryParams.append('order_by', 'creation desc');
        
        if (options.filters) {
            const filtersArray = buildFiltersArray(options.filters);
            
            if (filtersArray.length > 0) {
                queryParams.append('filters', JSON.stringify(filtersArray));
            }
        }
        const fullUrl = `/api/resource/Stock Entry?${queryParams.toString()}`;
        const { data } = await api.get(fullUrl);
        if (data && data.data) {
            return {
                success: true,
                data: data.data as InventoryItem[]
            };
        }
        
        return {
            success: false,
            error: new CommonException(ErrorCode.ENTITY_NOT_FOUND, 'Không có dữ liệu Stock Entry')
        };
        
    } catch (error: any) {
        const processedError = ApplicationLeaveErrorHandler.analyzeError(error);
        return {
            success: false,
            error: processedError
        };
    }
}

export async function getAllExportImportType(): Promise<dataFill[]> {
    try {
        const { data } = await api.get("/api/resource/Stock Entry Type");
        return data.data as dataFill[];
    } catch (error) {
        console.error("Error fetching Export/Import Types:", error);
        throw new CommonException(ErrorCode.STOCK_ENTRY_TYPE_NOT_FOUND);
    }
}

export async function getWarehouse(): Promise<dataFill[]> {
    try {
        const { data } = await api.get("/api/resource/Warehouse");
        return data.data as dataFill[];
    } catch (error) {
        console.error("Error fetching Warehouses:", error);
        throw new CommonException(ErrorCode.WAREHOUSE_NOT_FOUND);
    }
}