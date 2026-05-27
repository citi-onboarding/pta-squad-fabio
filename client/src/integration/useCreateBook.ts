import { useMutation } from "@tanstack/react-query";
import { BookService } from "./bookService";

export function useCreateBook() {
  return useMutation({
    mutationFn: BookService.create,
  });
}