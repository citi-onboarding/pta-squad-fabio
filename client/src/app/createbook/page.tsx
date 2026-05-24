"use client";

import { useState } from "react";
import Input from "@/components/ui/CreateBook/input";
import CategoryCard from "@/components/ui/CreateBook/categoryCard";
import { CATEGORIES, Category, BookFormData, BookFormErrors } from "@/components/ui/CreateBook/types";

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

  const [errors, setErrors] = useState<BookFormErrors>({});

  function handleChange(field: keyof BookFormData) {
    return (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof BookFormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  function handleCategorySelect(category: Category) {
    const newCategory = category === formData.categoria ? "" : category;
    setFormData((prev) => ({ ...prev, categoria: newCategory }));
    if (errors.categoria) {
      setErrors((prev) => ({ ...prev, categoria: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: BookFormErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = "*Este é um campo obrigatório.";
    if (!formData.autor.trim()) newErrors.autor = "*Este é um campo obrigatório.";
    if (!formData.isbn.trim()) newErrors.isbn = "*Este é um campo obrigatório.";
    if (!formData.editora.trim()) newErrors.editora = "*Este é um campo obrigatório.";
    if (!formData.ano.trim()) newErrors.ano = "*Este é um campo obrigatório.";
    if (!formData.quantidade.trim()) newErrors.quantidade = "*Este é um campo obrigatório.";
    if (!formData.categoria) newErrors.categoria = "*Selecione uma categoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (validate()) {
      console.log("Salvando livro:", formData);
    }
  }

  function handleCancel() {
    setFormData({ titulo: "", autor: "", isbn: "", editora: "", ano: "", quantidade: "", categoria: "" });
    setErrors({});
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Cadastrar Novo Livro</h1>
        <p className="mt-1 text-sm text-slate-500">Adicione um novo livro ao acervo</p>
      </div>

      <div className="rounded-[5px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-5">
          <Input label="Título" placeholder="Digite o título do livro" value={formData.titulo} onChange={handleChange("titulo")} error={errors.titulo} />
          <Input label="Autor" placeholder="Digite o nome do autor" value={formData.autor} onChange={handleChange("autor")} error={errors.autor} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input label="ISBN" placeholder="Digite o ISBN" value={formData.isbn} onChange={handleChange("isbn")} error={errors.isbn} />
          <Input label="Editora" placeholder="Digite a editora" value={formData.editora} onChange={handleChange("editora")} error={errors.editora} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Input label="Ano" placeholder="Digite o ano" value={formData.ano} onChange={handleChange("ano")} error={errors.ano} />
          <Input label="Quantidade" placeholder="Digite a quantidade" value={formData.quantidade} onChange={handleChange("quantidade")} error={errors.quantidade} />
        </div>

        <div className="mt-6">
          <label className="mb-3 block text-sm font-normal text-slate-700">Categoria</label>
          <div className="grid grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat} category={cat} selected={formData.categoria === cat} onSelect={handleCategorySelect} />
            ))}
          </div>
          {errors.categoria && <span className="mt-1.5 block text-xs text-red-500">{errors.categoria}</span>}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={handleCancel} className="rounded-[5px] border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} className="rounded-[5px] bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600">
            Salvar Livro
          </button>
        </div>
      </div>
    </main>
  );
}