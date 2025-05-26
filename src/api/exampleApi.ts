import axiosInstance from "./axiosInstance";
import { ExampleData } from "../types/example";

export async function fetchExampleData(): Promise<ExampleData> {
  try {
    const response = await axiosInstance.get<ExampleData>("/example");
    return response.data;
  } catch (error) {
    console.error("Error fetching example data:", error);
    throw error;
  }
}
