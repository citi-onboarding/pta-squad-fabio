"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

import Input from "@/components/ui/CreateBook/input";
import CategoryCard from "@/components/ui/CreateBook/categoryCard";

import RomanceCover from "@/assets/Covers/Romance.png";
import TecnologiaCover from "@/assets/Covers/Tecnologia.png";
import HistoriaCover from "@/assets/Covers/Historia.png";
import CienciasCover from "@/assets/Covers/Ciencias.png";
import InfantilCover from "@/assets/Covers/Infantil.png";

import {
  CATEGORIES,
  Category,
  BookFormErrors,
} from "@/components/ui/CreateBook/types";

import {
  bookSchema,
  BookFormData,
  BookPayload,
} from "@/components/ui/CreateBook/Schemas/bookSchema";

import { createBook } from "@/services/bookService";

const ROUTES = {
  HOME: "/",
  DASHBOARD: "/DashBoardPage",
  LIVRO:  "/Books",
};

const INITIAL_FORM_DATA: BookFormData = {
  titulo: "",
  autor: "",
  isbn: "",
  editora: "",
  ano: "",
  quantidade: "",
  categoria: "",
};

const CATEGORY_IMAGES = {
  Romance: RomanceCover,
  Tecnologia: TecnologiaCover,
  História: HistoriaCover,
  Ciências: CienciasCover,
  Infantil: InfantilCover,
};

export default function CadastrarNovoLivro() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<BookFormData>(INITIAL_FORM_DATA);

  const [errors, setErrors] =
    useState<BookFormErrors>({});

  const [loading, setLoading] =
    useState(false);

  function resetForm() {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  }

  function handleChange(field: keyof BookFormData) {
    return (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };
  }

  function handleCategorySelect(category: Category) {
    const selectedCategory =
      formData.categoria === category
        ? ""
        : category;

    setFormData((prev) => ({
      ...prev,
      categoria: selectedCategory,
    }));

    if (errors.categoria) {
      setErrors((prev) => ({
        ...prev,
        categoria: undefined,
      }));
    }
  }

  function validateForm(): BookPayload | null {
    const result = bookSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: BookFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field =
          issue.path[0] as keyof BookFormErrors;

        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);

      toast.error(
        "Preencha os campos corretamente."
      );

      return null;
    }

    setErrors({});

    return result.data;
  }

  async function handleSubmitBook(
    payload: BookPayload
  ) {
    if (loading) return;

    setLoading(true);

    const loadingToast = toast.loading(
      "Cadastrando livro..."
    );

    try {
      const response = await createBook(payload);

      toast.dismiss(loadingToast);

      toast.success(
        response.message ||
        "Livro cadastrado com sucesso!"
      );

      resetForm();

      setTimeout(() => {
        router.push(ROUTES.LIVRO );
      }, 2000);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Erro ao cadastrar o livro.";

        toast.error(message);
      } else {
        toast.error(
          "Erro inesperado. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    const payload = validateForm();

    if (!payload) return;

    handleSubmitBook(payload);
  }

  function handleCancel() {
    router.push(ROUTES.DASHBOARD);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Cadastrar Novo Livro
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Adicione um novo livro ao acervo
        </p>
      </div>

      <div className="rounded-[5px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Título"
            placeholder="Digite o título"
            value={formData.titulo}
            onChange={handleChange("titulo")}
            error={errors.titulo}
          />

          <Input
            label="Autor"
            placeholder="Digite o autor"
            value={formData.autor}
            onChange={handleChange("autor")}
            error={errors.autor}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input
            label="ISBN"
            placeholder="Digite o ISBN"
            value={formData.isbn}
            onChange={handleChange("isbn")}
            error={errors.isbn}
            variant="isbn"
            maxLength={17}
          />

          <Input
            label="Editora"
            placeholder="Digite a editora"
            value={formData.editora}
            onChange={handleChange("editora")}
            error={errors.editora}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input
            label="Ano"
            placeholder="Digite o ano"
            value={formData.ano}
            onChange={handleChange("ano")}
            error={errors.ano}
            variant="number"
            maxLength={4}
          />

          <Input
            label="Quantidade"
            placeholder="Digite a quantidade"
            value={formData.quantidade}
            onChange={handleChange("quantidade")}
            error={errors.quantidade}
            variant="number"
          />
        </div>

        <div className="mt-6">
          <label className="mb-3 block text-sm font-normal text-slate-700">
            Categoria
          </label>

          <div className="grid grid-cols-5 gap-3">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                image={CATEGORY_IMAGES[category]}
                selected={
                  formData.categoria === category
                }
                onSelect={handleCategorySelect}
              />
            ))}
          </div>

          {errors.categoria && (
            <span className="mt-1.5 block text-xs text-red-500">
              {errors.categoria}
            </span>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-[5px] border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-[5px] bg-[#FF0000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#CC0000] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Salvando...
              </>
            ) : (
              "Salvar Livro"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}