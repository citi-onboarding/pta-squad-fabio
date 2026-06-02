import { z } from "zod";

export const bookSchema = z.object({
  titulo: z
    .string()
    .min(1, "*Título é obrigatório."),

  autor: z
    .string()
    .min(1, "*Autor é obrigatório."),

  isbn: z
    .string()
    .min(1, "*ISBN é obrigatório.")
    .refine((value) => {
      // Remove tudo que não é dígito para contar
      const digitsOnly = value.replace(/\D/g, "");
      return digitsOnly.length === 10 || digitsOnly.length === 13;
    }, "*ISBN deve ter 10 ou 13 dígitos."),

  editora: z
    .string()
    .min(1, "*Editora é obrigatória."),

  ano: z
    .string()
    .min(1, "*Ano é obrigatório.")
    .transform(Number)
    .refine(
      (value) => !isNaN(value) && value > 0,
      "*Ano inválido."
    ),

  quantidade: z
    .string()
    .min(1, "*Quantidade é obrigatória.")
    .transform(Number)
    .refine(
      (value) => value > 0,
      "*Quantidade deve ser maior que zero."
    ),

  categoria: z
    .string()
    .min(1, "*Categoria obrigatória."),
});

export type BookFormData = z.input<typeof bookSchema>;

export type BookPayload = z.infer<typeof bookSchema>;