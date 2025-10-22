import { api } from "../config/api";
import { DeliveryNote, DeliveryNoteDetail } from "../types/deliveryNote.types";
import { CommonException } from "../utils/error/CommonException";
import { ErrorCode } from "../utils/error/ErrorCode";



export interface DeliveryNoteFilters {
    custom_id?: string;
    custom_sales_invoice?: string;
    creation?: string;
    customer?: string;
    workflow_state?: string;
    search_query?: string; // For multi-field search
}

export interface DeliveryNoteQueryOptions {
    fields?: string[];
    filters?: DeliveryNoteFilters;
    limit?: number;
    offset?: number;
    orderBy?: string;
}

export interface DeliveryNoteResult<T = any> {
    success: boolean;
    data?: T;
    error?: CommonException;
}

export interface DeliveryNoteDetailOptions {
    name: string; // e.g., XH251022069
    fields?: string[]; // optional list of fields
}
function buildFiltersArray(filters: DeliveryNoteFilters): any[] {
    const filterArray: any[] = [];

    // Multi-field search using search_query
    if (filters.search_query) {
        const searchTerm = filters.search_query.trim();
        if (searchTerm) {
            // Try different approach - use multiple separate filters
            // This should work as OR in Frappe when searching different fields
            filterArray.push(["custom_id", "like", `%${searchTerm}%`]);
            filterArray.push(["custom_sales_invoice", "like", `%${searchTerm}%`]);
            filterArray.push(["customer", "like", `%${searchTerm}%`]);
        }
    } else {
        // Individual field filters (when not using search_query)
        if (filters.custom_id) {
            // Check if the name filter contains wildcards for partial search
            if (filters.custom_id.includes('%')) {
                filterArray.push(["custom_id", "like", filters.custom_id]);
            } else {
                filterArray.push(["custom_id", "=", filters.custom_id]);
            }
        }

        if (filters.custom_sales_invoice) {
            if (filters.custom_sales_invoice.includes('%')) {
                filterArray.push(["custom_sales_invoice", "like", filters.custom_sales_invoice]);
            } else {
                filterArray.push(["custom_sales_invoice", "=", filters.custom_sales_invoice]);
            }
        }

        if (filters.customer) {
            if (filters.customer.includes('%')) {
                filterArray.push(["customer", "like", filters.customer]);
            } else {
                filterArray.push(["customer", "=", filters.customer]);
            }
        }
    }


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

    if (filters.workflow_state) {
        filterArray.push(["workflow_state", "=", filters.workflow_state]);
    }
    return filterArray;
}

export async function getDeliveryNote(options: DeliveryNoteQueryOptions = {}): Promise<DeliveryNoteResult<DeliveryNote[]>> {
    try {
        const defaultFields = [
            "custom_id",
            "custom_sales_invoice",
            "posting_date",
            "creation",
            "customer",
            "customer_name",
            "total_qty",
            "workflow_state",
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
        const fullUrl = `/api/resource/Delivery Note?${queryParams.toString()}`;
        const { data } = await api.get(fullUrl);
        if (data && data.data) {
            return {

                success: true,
                data: data.data as DeliveryNote[]
            };
        }
        return {
            success: false,
            error: new CommonException(ErrorCode.ENTITY_NOT_FOUND, 'Không có dữ liệu Delivery Note')
        };
    } catch (error) {
        console.error("Error fetching Delivery Note:", error);
        throw new CommonException(ErrorCode.DELIVERY_NOTE_NOT_FOUND);
    }
}

/**
 * Get Delivery Note detail by name with optional fields selection
 * Example endpoint:
 * /api/resource/Delivery Note/XH251022069?fields=["name","customer_name",...]
 */
export async function getDeliveryNoteDetail(
    name: string,
    fields?: string[]
): Promise<DeliveryNoteResult<DeliveryNoteDetail>> {
    try {
        const encodedName = encodeURIComponent(name);
        const queryParams = new URLSearchParams();
        if (fields && fields.length > 0) {
            queryParams.append('fields', JSON.stringify(fields));
        }
        const url = queryParams.toString()
            ? `/api/resource/Delivery Note/${encodedName}?${queryParams.toString()}`
            : `/api/resource/Delivery Note/${encodedName}`;

        const { data } = await api.get(url);
        if (data && data.data) {
            return { success: true, data: data.data as DeliveryNoteDetail };
        }
        return {
            success: false,
            error: new CommonException(
                ErrorCode.ENTITY_NOT_FOUND,
                'Không tìm thấy chi tiết Delivery Note'
            )
        };
    } catch (error: any) {
        return {
            success: false,
            error: new CommonException(
                ErrorCode.DELIVERY_NOTE_NOT_FOUND,
                error?.response?.data?.message || error?.message || 'Lỗi tải chi tiết Delivery Note'
            )
        };
    }
}

/**
 * Update Delivery Note by name. Pass only fields you want to update.
 * Note: For child table `items`, include full array with each child's `name` to update quantities safely.
 */
export async function updateDeliveryNote(
    name: string,
    payload: Partial<DeliveryNoteDetail> & { items?: Array<any> }
): Promise<DeliveryNoteResult<DeliveryNoteDetail>> {
    try {
        const encodedName = encodeURIComponent(name);
        const url = `/api/resource/Delivery Note/${encodedName}`;
        const { data } = await api.put(url, payload);
        if (data && data.data) {
            return { success: true, data: data.data as DeliveryNoteDetail };
        }
        return {
            success: false,
            error: new CommonException(
                ErrorCode.ENTITY_NOT_FOUND,
                'Không cập nhật được Delivery Note'
            )
        };
    } catch (error: any) {
        return {
            success: false,
            error: new CommonException(
                ErrorCode.DELIVERY_NOTE_NOT_FOUND,
                error?.response?.data?.message || error?.message || 'Lỗi cập nhật Delivery Note'
            )
        };
    }
}

/**
 * Delete Delivery Note by name
 */
export async function deleteDeliveryNote(name: string): Promise<DeliveryNoteResult<null>> {
    try {
        const encodedName = encodeURIComponent(name);
        const url = `/api/resource/Delivery Note/${encodedName}`;
        const { data } = await api.delete(url);
        // Frappe returns 202/200; treat as success when no error thrown
        return { success: true, data: null };
    } catch (error: any) {
        return {
            success: false,
            error: new CommonException(
                ErrorCode.DELIVERY_NOTE_NOT_FOUND,
                error?.response?.data?.message || error?.message || 'Lỗi xóa Delivery Note'
            )
        };
    }
}


// New function to handle multi-field search
async function performMultiFieldSearch(
    searchTerm: string, 
    fields: string[], 
    limit: number, 
    offset: number, 
    otherFilters: DeliveryNoteFilters
): Promise<DeliveryNoteResult<DeliveryNote[]>> {
    try {
        const searchTermTrimmed = searchTerm.trim();
        if (!searchTermTrimmed) {
            return { success: false, error: new CommonException(ErrorCode.ENTITY_NOT_FOUND, 'Từ khóa tìm kiếm không hợp lệ') };
        }

        // Create separate queries for each field
        const queries = [
            // Search in custom_id
            createSearchQuery(fields, limit, offset, [["custom_id", "like", `%${searchTermTrimmed}%`]], otherFilters),
            // Search in custom_sales_invoice
            createSearchQuery(fields, limit, offset, [["custom_sales_invoice", "like", `%${searchTermTrimmed}%`]], otherFilters),
            // Search in customer
            createSearchQuery(fields, limit, offset, [["customer", "like", `%${searchTermTrimmed}%`]], otherFilters)
        ];

        // Execute all queries in parallel
        const results = await Promise.all(queries);
        
        // Merge and deduplicate results
        const allResults: DeliveryNote[] = [];
        const seenIds = new Set<string>();
        
        results.forEach(result => {
            if (result.success && result.data) {
                result.data.forEach(item => {
                    if (!seenIds.has(item.custom_id)) {
                        seenIds.add(item.custom_id);
                        allResults.push(item);
                    }
                });
            }
        });

        // Sort by creation date (newest first)
        allResults.sort((a, b) => new Date(b.creation).getTime() - new Date(a.creation).getTime());

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
        throw new CommonException(ErrorCode.DELIVERY_NOTE_NOT_FOUND);
    }
}

// Helper function to create search query
async function createSearchQuery(
    fields: string[], 
    limit: number, 
    offset: number, 
    searchFilters: any[], 
    otherFilters: DeliveryNoteFilters
): Promise<DeliveryNoteResult<DeliveryNote[]>> {
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

        const fullUrl = `/api/resource/Delivery Note?${queryParams.toString()}`;
        const { data } = await api.get(fullUrl);
        
        if (data && data.data) {
            return {
                success: true,
                data: data.data as DeliveryNote[]
            };
        }
        
        return {
            success: false,
            error: new CommonException(ErrorCode.ENTITY_NOT_FOUND, 'Không có dữ liệu')
        };
    } catch (error) {
        console.error("Error in createSearchQuery:", error);
        return {
            success: false,
            error: new CommonException(ErrorCode.DELIVERY_NOTE_NOT_FOUND)
        };
    }
}