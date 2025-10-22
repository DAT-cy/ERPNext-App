import { CommonException, ErrorCode } from "..";
import { api } from "../config/api";
import { CheckListInventory } from "../types/checkListInventory.types";


export async function fetchCheckListInventory(item_code: string): Promise<CheckListInventory[]> {
    try {
        const response = await api.get(`/api/method/remak.utils.item.get_item_stock?item_code=${item_code}`);
        return response.data.message;
    } catch (error: any) {
        throw new CommonException(ErrorCode.PRODUCT_NOT_FOUND);
    }
}