import { api } from "../config/api";
import { handleServiceError, handleServiceThrow } from "../utils/error/ErrorHandler";

export type PurchaseReceipt = {
    name: string;
    posting_date: string;
    supplier_name?: string;
    total_qty: string | number;
    workflow_state: string;
    creation?: string;
    supplier?: string;
}

export type PurchaseReceiptItem = {
    item_code?: string;
    item_name?: string;
    qty?: number | string;
    uom?: string;
    warehouse?: string;
    barcode?: string;
};

export type PurchaseReceiptDetail = {
    name: string;
    supplier?: string;
    supplier_name?: string;
    posting_date?: string;
    creation?: string;
    workflow_state?: string;
    total_qty?: number | string;
    items?: PurchaseReceiptItem[];
};

export interface PurchaseReceiptFilters {
    name?: string;
    supplier?: string;
    supplier_name?: string;
    creation?: string;
    workflow_state?: string;
    search_query?: string; // For multi-field search
}

export interface PurchaseReceiptQueryOptions {
    fields?: string[];
    filters?: PurchaseReceiptFilters;
    limit?: number;
    offset?: number;
    orderBy?: string;
}

export interface PurchaseReceiptResult<T = any> {
    success: boolean;
    data?: T;
    error?: string; // Vietnamese error message
}

export interface PurchaseReceiptDetailOptions {
    name: string; // e.g., PR-0001
    fields?: string[]; // optional list of fields
}


function buildFiltersArray(filters: PurchaseReceiptFilters): any[] {
    const filterArray: any[] = [];

    // Multi-field search using search_query
    if (filters.search_query) {
        const searchTerm = filters.search_query.trim();
        if (searchTerm) {
            filterArray.push(["name", "like", `%${searchTerm}%`]);
            filterArray.push(["supplier", "like", `%${searchTerm}%`]);
        }
    } else {
        // Individual field filters (when not using search_query)
        if (filters.name) {
            if (filters.name.includes('%')) {
                filterArray.push(["name", "like", filters.name]);
            } else {
                filterArray.push(["name", "=", filters.name]);
            }
        }

        if (filters.supplier) {
            if (filters.supplier.includes('%')) {
                filterArray.push(["supplier", "like", filters.supplier]);
            } else {
                filterArray.push(["supplier", "=", filters.supplier]);
            }
        }

        if (filters.supplier_name) {
            if (filters.supplier_name.includes('%')) {
                filterArray.push(["supplier_name", "like", filters.supplier_name]);
            } else {
                filterArray.push(["supplier_name", "=", filters.supplier_name]);
            }
        }
    }

    if (filters.creation) {
        try {
            const frappeFilters = JSON.parse(filters.creation);
            if (Array.isArray(frappeFilters)) {
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

    if (filters.workflow_state) {
        filterArray.push(["workflow_state", "=", filters.workflow_state]);
    }
    return filterArray;
}

export async function getPurchaseReceipt(options: PurchaseReceiptQueryOptions = {}): Promise<PurchaseReceiptResult<PurchaseReceipt[]>> {
    try {
        const defaultFields = [
            "name",
            "posting_date",
            "supplier_name",
            "total_qty",
            "workflow_state",
            "creation",
            "supplier",
        ];
        const fields = options.fields || defaultFields;
        const limit = options.limit || 10;
        const offset = options.offset || 0;

        // Handle multi-field search separately
        if (options.filters?.search_query) {
            return await performMultiFieldSearch(options.filters.search_query, fields, limit, offset, options.filters);
        }

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
        const fullUrl = `/api/resource/Purchase Receipt?${queryParams.toString()}`;
        const { data } = await api.get(fullUrl);
        if (data && data.data) {
            return {
                success: true,
                data: data.data as PurchaseReceipt[]
            };
        }
        return {
            success: false,
            error: 'Không có dữ liệu Purchase Receipt'
        };
    } catch (error) {
        console.error("Error fetching Purchase Receipt:", error);
        handleServiceThrow(error, 'Lỗi tải danh sách Purchase Receipt');
    }
}

/**
 * Get Purchase Receipt detail by name with optional fields selection
 * Example endpoint:
 * /api/resource/Purchase Receipt/PR-0001?fields=["name","supplier_name",...]
 */
export async function getPurchaseReceiptDetail(
    name: string,
    fields?: string[]
): Promise<PurchaseReceiptResult<PurchaseReceiptDetail>> {
    try {
        const encodedName = encodeURIComponent(name);
        const queryParams = new URLSearchParams();
        if (fields && fields.length > 0) {
            queryParams.append('fields', JSON.stringify(fields));
        }
        const url = queryParams.toString()
            ? `/api/resource/Purchase Receipt/${encodedName}?${queryParams.toString()}`
            : `/api/resource/Purchase Receipt/${encodedName}`;

        const { data } = await api.get(url);
        if (data && data.data) {
            return { success: true, data: data.data as PurchaseReceiptDetail };
        }
        return {
            success: false,
            error: 'Không tìm thấy chi tiết Purchase Receipt'
        };
    } catch (error: any) {
        return handleServiceError(error, 'Lỗi tải chi tiết Purchase Receipt');
    }
}

/**
 * Update Purchase Receipt by name. Pass only fields you want to update.
 * Note: For child table `items`, include full array with each child's `name` to update quantities safely.
 */
export async function updatePurchaseReceipt(
    name: string,
    payload: Partial<PurchaseReceiptDetail> & { items?: Array<any> }
): Promise<PurchaseReceiptResult<PurchaseReceiptDetail>> {
    try {
        const encodedName = encodeURIComponent(name);
        const url = `/api/resource/Purchase Receipt/${encodedName}`;
        const { data } = await api.put(url, payload);
        if (data && data.data) {
            return { success: true, data: data.data as PurchaseReceiptDetail };
        }
        return {
            success: false,
            error: 'Không cập nhật được Purchase Receipt'
        };
    } catch (error: any) {
        return handleServiceError(error, 'Lỗi cập nhật Purchase Receipt');
    }
}

/**
 * Delete Purchase Receipt by name
 */
export async function deletePurchaseReceipt(name: string): Promise<PurchaseReceiptResult<null>> {
    try {
        const encodedName = encodeURIComponent(name);
        const url = `/api/resource/Purchase Receipt/${encodedName}`;
        const { data } = await api.delete(url);
        // Frappe returns 202/200; treat as success when no error thrown
        return { success: true, data: null };
    } catch (error: any) {
        return handleServiceError(error, 'Lỗi xóa Purchase Receipt');
    }
}

// New function to handle multi-field search
async function performMultiFieldSearch(
    searchTerm: string, 
    fields: string[], 
    limit: number, 
    offset: number, 
    otherFilters: PurchaseReceiptFilters
): Promise<PurchaseReceiptResult<PurchaseReceipt[]>> {
    try {
        const searchTermTrimmed = searchTerm.trim();
        if (!searchTermTrimmed) {
            return { success: false, error: 'Từ khóa tìm kiếm không hợp lệ' };
        }

        // Create separate queries for each field
        const queries = [
            // Search in name
            createSearchQuery(fields, limit, offset, [["name", "like", `%${searchTermTrimmed}%`]], otherFilters),
            // Search in supplier
            createSearchQuery(fields, limit, offset, [["supplier", "like", `%${searchTermTrimmed}%`]], otherFilters)
        ];

        // Execute all queries in parallel
        const results = await Promise.all(queries);
        
        // Merge and deduplicate results
        const allResults: PurchaseReceipt[] = [];
        const seenIds = new Set<string>();
        
        results.forEach(result => {
            if (result.success && result.data) {
                result.data.forEach(item => {
                    if (!seenIds.has(item.name)) {
                        seenIds.add(item.name);
                        allResults.push(item);
                    }
                });
            }
        });

        // Sort by creation date (newest first)
        allResults.sort((a, b) => new Date(b.creation || '').getTime() - new Date(a.creation || '').getTime());

        // Apply limit and offset
        const startIndex = offset;
        const endIndex = startIndex + limit;
        const paginatedResults = allResults.slice(startIndex, endIndex);

        return {
            success: true,
            data: paginatedResults
        };
    } catch (error) {
        console.error("Error in multi-field search:", error);
        handleServiceThrow(error, 'Lỗi tìm kiếm Purchase Receipt');
    }
}

// Helper function to create search query
async function createSearchQuery(
    fields: string[], 
    limit: number, 
    offset: number, 
    searchFilters: any[], 
    otherFilters: PurchaseReceiptFilters
): Promise<PurchaseReceiptResult<PurchaseReceipt[]>> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('fields', JSON.stringify(fields));
        queryParams.append('limit_page_length', limit.toString());
        queryParams.append('limit_start', offset.toString());
        queryParams.append('order_by', 'creation desc');

        // Combine search filters with other filters
        const allFilters = [...searchFilters];
        
        // Add other filters (excluding search_query)
        const otherFiltersArray = buildFiltersArray({
            ...otherFilters,
            search_query: undefined
        });
        allFilters.push(...otherFiltersArray);

        if (allFilters.length > 0) {
            queryParams.append('filters', JSON.stringify(allFilters));
        }

        const fullUrl = `/api/resource/Purchase Receipt?${queryParams.toString()}`;
        const { data } = await api.get(fullUrl);
        
        if (data && data.data) {
            return {
                success: true,
                data: data.data as PurchaseReceipt[]
            };
        }
        
        return {
            success: false,
            error: 'Không có dữ liệu'
        };
    } catch (error) {
        console.error("Error in createSearchQuery:", error);
        return handleServiceError(error, 'Lỗi tìm kiếm Purchase Receipt');
    }
}
