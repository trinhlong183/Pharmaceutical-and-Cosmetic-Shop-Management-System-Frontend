import http from "@/lib/http";
import {
  CreateInventoryLogBodyType,
  InventoryLogType,
  InventoryQueryParamsType,
} from "@/schemaValidations/inventory.schma";
import { get } from "http";

export const inventoryService = {
  getAllInventoryLogs: (param: InventoryQueryParamsType) => {
    return http
      .get<{ data: { logs: InventoryLogType[] } }>("/inventory-logs", {
        params: param,
      })
      .then((response) => {
        return response.payload.data.logs;
      });
  },
  createInventoryLogs: (body: CreateInventoryLogBodyType) => {
    return http.post("/inventory-logs", body);
  },
  reviewInventoryLogs: (id: string, body: any) => {
    return http.patch(`/inventory-logs/${id}/review`, body);
  },
};
