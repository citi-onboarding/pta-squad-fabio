import { api } from "./api";
import type {BookPayload} from "../components/ui/CreateBook/Schemas/bookSchema";

export const BookService = {
  create: async (data: BookPayload) => {
    const response = await api.post(
      "/books",
      data
    );

    return response.data;
  },


};