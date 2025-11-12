import { api } from "../config/api";
import { handleServiceError, handleServiceThrow } from "../utils/error/ErrorHandler";

export interface ShipmentParcel {
    name?: string;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    count?: number;
}

export interface Shipment {
    name: string;
    workflow_state?: string;
    custom_warehouse?: string;
    custom_reference_type?: string | null;
    custom_reference_name?: string;
    custom_posting_date?: string;
    custom_vehicle?: string;
    custom_service_provider_type?:string;
    custom_selling_amount?:number;
    custom_expense_amount?:number;
    shipment_amount?:number;
    custom_party_amount?:number;
    custom_profit_amount?:number;
    custom_cod_amount?:number;
    status?:string;
    custom_party?:string;
    custom_party_user?:string;
    custom_driver?:string;
    custom_driver_name?:string;
    custom_driver_phone?:string;
    
    
}

export interface ShipmentFilters {
    workflow_state?: string;
    creation?: string;
    name?: string;
    custom_posting_date?: string;
    custom_vehicle?: string;
    custom_service_provider_type?: string;
    search_query?: string; // For multi-field search
}

export interface ShipmentQueryOptions {
    fields?: string[];
    filters?: ShipmentFilters;
    limit?: number;
    offset?: number;
    orderBy?: string;
}

export interface ShipmentResult<T = any> {
    success: boolean;
    data?: T;
    error?: string; // Vietnamese error message
}

function buildFiltersArray(filters: ShipmentFilters): any[] {
    const filterArray: any[] = [];

        // Individual field filters (when not using search_query)
        if (filters.name) {
            if (filters.name.includes('%')) {
                filterArray.push(["name", "like", filters.name]);
            } else {
                filterArray.push(["name", "=", filters.name]);
            }
        }

        if (filters.workflow_state) {
            filterArray.push(["workflow_state", "=", filters.workflow_state]);
        }

        if (filters.custom_posting_date) {
            try {
                const frappeFilters = JSON.parse(filters.custom_posting_date);
                if (Array.isArray(frappeFilters)) {
                    frappeFilters.forEach((filter) => {
                        if (Array.isArray(filter) && filter.length === 3) {
                            filterArray.push(filter);
                        }
                    });
                }
            } catch (error) {
                // ignore parse error
            }
        }

        if (filters.custom_vehicle) {
                filterArray.push(["custom_vehicle", "=", filters.custom_vehicle]);
        }
    

    if (filters.creation) {
        try {
            const frappeFilters = JSON.parse(filters.creation);
            if (Array.isArray(frappeFilters)) {
                frappeFilters.forEach((filter) => {
                    if (Array.isArray(filter) && filter.length === 3) {
                        filterArray.push(filter);
                    }
                });
            }
        } catch (error) {   
        }
    }

    return filterArray;
}

export async function getAllShipments(options: ShipmentQueryOptions = {}): Promise<ShipmentResult<Shipment[]>> {
    try {
        const defaultFields = [
            "name",
            "workflow_state",
            "custom_posting_date",
            "custom_vehicle",
            "custom_service_provider_type",
        ];
        const fields = options.fields || defaultFields;
        const limit = options.limit || 10;
        const offset = options.offset || 0;


        const queryParams = new URLSearchParams();
        queryParams.append('fields', JSON.stringify(fields));
        queryParams.append('limit_page_length', limit.toString());
        queryParams.append('limit_start', offset.toString());
        queryParams.append('order_by', options.orderBy || 'creation desc');

        // Build filters array - always include filters parameter (even if empty)
        let filtersArray: any[] = [];
        if (options.filters) {
            filtersArray = buildFiltersArray(options.filters);
        }
        queryParams.append('filters', filtersArray.length > 0 ? JSON.stringify(filtersArray) : '');
        
        const fullUrl = `/api/resource/Shipment?${queryParams.toString()}`;
        const response = await api.get(fullUrl);

        if (response.data) {
            // Check if response.data is an array (direct array response)
            if (Array.isArray(response.data)) {
                return {
                    success: true,
                    data: response.data as Shipment[]
                };
            }
            // Check if response.data.data exists (nested structure)
            if (response.data.data && Array.isArray(response.data.data)) {
                return {
                    success: true,
                    data: response.data.data as Shipment[]
                };
            }
        }
        
        return {
            success: false,
            error: 'Không có dữ liệu Shipment'
        };
    } catch (error) {
        console.error("Error fetching Shipment:", error);
        handleServiceThrow(error, 'Lỗi tải danh sách Shipment');
    }
}

export async function getShipmentDetail(
    name: string,
    fields?: string[]
): Promise<ShipmentResult<Shipment>> {
    try {
        const encodedName = encodeURIComponent(name);
        const queryParams = new URLSearchParams();
        if (fields && fields.length > 0) {
            queryParams.append('fields', JSON.stringify(fields));
        }
        const url =`/api/resource/Shipment/${encodedName}`;
        console.log('url', url);
        const response = await api.get(url);
        console.log('response', response.data.data);
        return { success: true, data: response.data.data as Shipment };
    } catch (error: any) {
        console.error('Error fetching Shipment detail:', error);
        return handleServiceThrow(error, 'Lỗi tải chi tiết Shipment');
    }
}
