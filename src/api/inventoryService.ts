import http from "@/lib/http";
import {
  CreateInventoryLogBodyType,
  InventoryLogType,
  InventoryQueryParamsType,
} from "@/schemaValidations/inventory.schma";

type reviewInventoryLogsBody = {
  approved: boolean;
  reason?: string;
};

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
  getInventoryLogById: (id: string) => {
    return http
      .get<{ data: InventoryLogType }>(`/inventory-logs/${id}`)
      .then((response) => {
        return response.payload.data;
      });
  },
  createInventoryLogs: (body: CreateInventoryLogBodyType) => {
    return http.post("/inventory-logs", body);
  },
  reviewInventoryLogs: (inventoryId: string, body: reviewInventoryLogsBody) => {
    return http.post(`/inventory-logs/${inventoryId}/review`, body);
  },
};
