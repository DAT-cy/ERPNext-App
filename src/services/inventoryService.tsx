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

// Hàm helper để build filters array
function buildFiltersArray(filters: InventoryFilters): string[][] {
    const filterArray: string[][] = [];
    
    if (filters.name) {
        filterArray.push(["stock_entry_type", "=", filters.name]);
    }

    // Filter theo stock_entry_type
    if (filters.stock_entry_type) {
        console.log('📦 [buildFiltersArray] Adding stock_entry_type filter:', filters.stock_entry_type);
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
    
    // Filter theo creation date range - expect Frappe filter format
    if (filters.creation) {
        console.log('📅 [buildFiltersArray] Processing creation filter:', filters.creation);
        try {
            // Parse Frappe filter format: [["creation", ">=", "2025-10-10 00:00:00"], ["creation", "<=", "2025-10-10 23:59:59"]]
            const frappeFilters = JSON.parse(filters.creation);
            console.log('📅 [buildFiltersArray] Parsed Frappe filters:', frappeFilters);
            
            if (Array.isArray(frappeFilters)) {
                // Add all filters from the array
                frappeFilters.forEach((filter, index) => {
                    console.log(`📅 [buildFiltersArray] Adding Frappe filter ${index + 1}:`, filter);
                    if (Array.isArray(filter) && filter.length === 3) {
                        filterArray.push(filter);
                    }
                });
            }
        } catch (error) {
            console.error('❌ [buildFiltersArray] Error parsing creation filter:', error);
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
    
    console.log('✅ [buildFiltersArray] Final filter array:', filterArray);
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
            console.log('🔍 [getAllInventory] Built filters array:', filtersArray);
            
            if (filtersArray.length > 0) {
                queryParams.append('filters', JSON.stringify(filtersArray));
                console.log('📤 [getAllInventory] Added filters to query params:', JSON.stringify(filtersArray));
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

