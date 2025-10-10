import { api } from "../config/api";
import { getEmployeeCodeByEmail } from "./authService";
import { 
  ApplicationLeaveErrorHandler, 
  ApplicationLeaveResult,
  ApplicationLeaveErrorCode
} from "../utils/error/applicationLeave";
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
    orderBy?: string;
}

// Hàm helper để build filters array
function buildFiltersArray(filters: InventoryFilters): string[][] {
    const filterArray: string[][] = [];
    
    // Filter theo stock_entry_type
    if (filters.stock_entry_type) {
        filterArray.push(["stock_entry_type", "=", filters.stock_entry_type]);
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
    
    // Filter theo creation date range
    if (filters.creation) {
        filterArray.push(["creation", "=", filters.creation]);
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
        // Default fields nếu không được specify
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
        const limit = options.limit || 20;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('fields', JSON.stringify(fields));
        queryParams.append('limit_page_length', limit.toString());
        
        if (options.filters) {
            const filtersArray = buildFiltersArray(options.filters);
            if (filtersArray.length > 0) {
                queryParams.append('filters', JSON.stringify(filtersArray));
            }
        }
                
        const { data } = await api.get(`/api/resource/Stock Entry?${queryParams.toString()}`);
        
        console.log('📦 [getAllInventory] API Response:', data);
        
        if (data && data.data) {
            return {
                success: true,
                data: data.data as InventoryItem[]
            };
        }
        
        return {
            success: false,
            error: {
                code: ApplicationLeaveErrorCode.UNKNOWN_ERROR,
                message: 'Không có dữ liệu Stock Entry',
                userMessage: 'Không có dữ liệu Stock Entry',
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error: any) {
        console.error('❌ [getAllInventory] Error:', error);
        
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
        throw error;
    }
}

export async function getWarehouse(): Promise<dataFill[]> {
    try {
        const { data } = await api.get("/api/resource/Warehouse");
        return data.data as dataFill[];
    } catch (error) {
        console.error("Error fetching Warehouses:", error);
        throw error;
    }
}

