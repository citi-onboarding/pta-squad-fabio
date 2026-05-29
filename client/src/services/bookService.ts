import { api } from "./api";
import { BookPayload } from "@/components/ui/CreateBook/Schemas/bookSchema";

interface CreateBookRequest {
  titulo: string;
  autor: string;
  isbn: string;
  editora: string;
  ano: number;
  quantidadeTotal: number;
  categoria: string;
}

interface CreateBookResponse {
  message: string;
}

// Mapeamento de categorias do frontend para o backend
const categoryMap: Record<string, string> = {
  Romance: "ROMANCE",
  Tecnologia: "TECNOLOGIA",
  História: "HISTORIA",
  Ciências: "CIENCIAS",
  Infantil: "INFANTIL",
};

export async function createBook(bookData: BookPayload): Promise<CreateBookResponse> {
  // Remove tudo que não é dígito do ISBN
  const isbnDigitsOnly = bookData.isbn.replace(/\D/g, "");

  const payload: CreateBookRequest = {
    ...bookData,
    isbn: isbnDigitsOnly,
    quantidadeTotal: bookData.quantidade,
    categoria: categoryMap[bookData.categoria] || bookData.categoria,
  };

  const response = await api.post<CreateBookResponse>("/book", payload);
  return response.data;
}

export async function getBooks(filters?: {
  titulo?: string;
  autor?: string;
  categoria?: string;
}) {
  const response = await api.get("/book", { params: filters });
  return response.data;
}

export async function getBookById(id: string) {
  const response = await api.get(`/book/${id}`);
  return response.data;
}

export async function deleteBook(id: string) {
  const response = await api.delete(`/book/${id}`);
  return response.data;
}
