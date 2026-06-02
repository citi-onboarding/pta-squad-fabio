export type Category =
  | "Romance"
  | "Tecnologia"
  | "História"
  | "Ciências"
  | "Infantil";

export const CATEGORIES: Category[] = [
  "Romance",
  "Tecnologia",
  "História",
  "Ciências",
  "Infantil",
];

export interface BookFormErrors {
  titulo?: string;
  autor?: string;
  isbn?: string;
  editora?: string;
  ano?: string;
  quantidade?: string;
  categoria?: string;
}