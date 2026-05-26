"use client";

import { useState } from "react";
import Input from "@/components/ui/CreateBook/input";
import CategoryCard from "@/components/ui/CreateBook/categoryCard";
import RomanceCover from "@/assets/Covers/Romance.png";
import TecnologiaCover from "@/assets/Covers/Tecnologia.png";
import HistoriaCover from "@/assets/Covers/Historia.png";
import CienciasCover from "@/assets/Covers/Ciencias.png";
import InfantilCover from "@/assets/Covers/Infantil.png";
import { useRouter } from "next/navigation";

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

export default function CadastrarNovoLivro() {
  const [formData, setFormData] = useState<BookFormData>({
    titulo: "",
    autor: "",
    isbn: "",
    editora: "",
    ano: "",
    quantidade: "",
    categoria: "",
  });

  const CATEGORY_IMAGES = {
    Romance: RomanceCover,
    Tecnologia: TecnologiaCover,
    História: HistoriaCover,
    Ciências: CienciasCover,
    Infantil: InfantilCover,
  };

  const router = useRouter();

  const [errors, setErrors] = useState<BookFormErrors>({});

  function handleChange(field: keyof BookFormData) {
    return (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field as keyof BookFormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };
  }

  function handleCategorySelect(category: Category) {
    const newCategory =
      category === formData.categoria
        ? ""
        : category;

    setFormData((prev) => ({
      ...prev,
      categoria: newCategory,
    }));

    if (errors.categoria) {
      setErrors((prev) => ({
        ...prev,
        categoria: undefined,
      }));
    }
  }

  function validate(): boolean {
    const result = bookSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: BookFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field =
          issue.path[0] as keyof BookFormErrors;

        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);

      return false;
    }

    setErrors({});

    return true;
  }

  function handleSave() {
    const result = bookSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: BookFormErrors = {};

      result.error.issues.forEach((issue) => {
        const field =
          issue.path[0] as keyof BookFormErrors;

        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);

      return;
    }

    const payload: BookPayload = result.data;

    console.log("Livro validado:", payload);

    /*
      payload:
      {
        titulo: string
        autor: string
        isbn: string
        editora: string
        ano: number
        quantidade: number
        categoria: string
      }
    */
  }

  function handleCancel() {
    setFormData({
      titulo: "",
      autor: "",
      isbn: "",
      editora: "",
      ano: "",
      quantidade: "",
      categoria: "",
    });

    setErrors({});

    router.push("/");
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
            placeholder="Digite o título "
            value={formData.titulo}
            onChange={handleChange("titulo")}
            error={errors.titulo}
          />

          <Input
            label="Autor"
            placeholder="Digite o autor "
            value={formData.autor}
            onChange={handleChange("autor")}
            error={errors.autor}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input
            label="ISBN"
            placeholder="Digite o ISBN "
            value={formData.isbn}
            onChange={handleChange("isbn")}
            error={errors.isbn}
            variant="isbn"
            maxLength={17}
          />

          <Input
            label="Editora"
            placeholder="Digite a editora "
            value={formData.editora}
            onChange={handleChange("editora")}
            error={errors.editora}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input
            label="Ano"
            placeholder="Digite o ano "
            value={formData.ano}
            onChange={handleChange("ano")}
            error={errors.ano}
            variant="number"
            maxLength={4}
          />

          <Input
            label="Quantidade"
            placeholder="Digite a quantidade "
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
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat}
                category={cat}
                image={CATEGORY_IMAGES[cat]}
                selected={formData.categoria === cat}
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
            className="rounded-[5px] border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-[5px] bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Salvar Livro
          </button>
        </div>
      </div>
    </main>
  );
}