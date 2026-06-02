import React from "react";
import { View, Text, Image, ImageRequireSource, useWindowDimensions, Platform } from "react-native";
import CalendarIcon from "@assets/icons/calendar.svg";

export type CategoriaLivro =
  | "ROMANCE"
  | "INFANTIL"
  | "TECNOLOGIA"
  | "HISTORIA"
  | "CIENCIAS";

export type StatusEmprestimo = "EM_ANDAMENTO" | "DEVOLVIDO" | "ATRASADO";

// Modelo Livro 
export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  editora: string;
  ano: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  categoria: CategoriaLivro;
}

// Modelo Emprestimo
export interface Emprestimo {
  id: string;
  livroId: string;
  livro: Livro;
  nomeCliente: string;
  emailCliente: string;
  dataLocacao: string;
  dataPrevistaDevolucao: string;
  status: StatusEmprestimo;
}

// Mapeamento categoria 
const CAPA_POR_CATEGORIA: Record<CategoriaLivro, ImageRequireSource> = {
  ROMANCE:    require("@assets/Covers/Romance.png"),
  INFANTIL:   require("@assets/Covers/Infantil.png"),
  TECNOLOGIA: require("@assets/Covers/Tecnologia.png"),
  HISTORIA:   require("@assets/Covers/Historia.png"),
  CIENCIAS:   require("@assets/Covers/Ciencias.png"),
};

// Fallback se não houver capa para a categoria
const CAPA_FALLBACK: ImageRequireSource = require("@assets/icon.png");

function getCapaPorCategoria(categoria: CategoriaLivro): ImageRequireSource {
  return CAPA_POR_CATEGORIA[categoria] ?? CAPA_FALLBACK;
}

// Formata ISO 
function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  const dia = data.getDate().toString().padStart(2, "0");
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

interface CardEmprestimoProps {
  emprestimo: Emprestimo;
}

// Componente principal que recebe emprestimo e exibe capa, título, badge e datas
export default function CardEmprestimo({ emprestimo }: CardEmprestimoProps): React.ReactElement {
  const { livro, dataLocacao, dataPrevistaDevolucao, status } = emprestimo;
  const { width } = useWindowDimensions();

  // Figma specs
  const HORIZONTAL_MARGIN = width > 420 ? 24 : 16;
  const IMAGE_WIDTH = Math.min(96, Math.max(56, Math.floor(width * 0.16)));
  const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH * 1.6);

  const statusConfig: Record<StatusEmprestimo, { label: string; bg: string; text: string }> = {
    EM_ANDAMENTO: { label: "Em andamento", bg: "bg-yellow-100", text: "text-yellow-700" },
    DEVOLVIDO:    { label: "Devolvido",    bg: "bg-green-100",  text: "text-green-700" },
    ATRASADO:     { label: "Atrasado",     bg: "bg-red-100",    text: "text-red-600" },
  };
  const { label, bg, text } = statusConfig[status as StatusEmprestimo];

  
  return (
    <View
      className="bg-white rounded-xl mx-4 my-2 flex-row items-start gap-3"
      style={{
        padding: 16,
        paddingLeft: HORIZONTAL_MARGIN,
        paddingRight: HORIZONTAL_MARGIN,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          },
          android: {
            elevation: 4,
          },
        }),
      }}
    >
      <Image
        source={getCapaPorCategoria(livro.categoria)}
        style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, borderRadius: 8 }}
        className="bg-gray-100"
        resizeMode="cover"
      />
      <View className="flex-1 ">
        <Text numberOfLines={2} className="text-base font-barlowSemiBold text-black mb-1 leading-6">
          {livro.titulo}
        </Text>
        <View className={`self-start px-3 py-0.5 rounded-full mb-2 ${bg}`} style={{ alignSelf: 'flex-start' }}>
          <Text className={`text-xs font-barlowMedium ${text}`} style={{ lineHeight: 16 }}>{label}</Text>
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <CalendarIcon width={14} height={14} />
          <Text className="text-sm font-barlowRegular text-gray-600">
            Locação: <Text className="font-barlowRegular text-gray-600">{formatarData(dataLocacao)}</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 mt-1">
          <CalendarIcon width={14} height={14} />
          <Text className="text-sm font-barlowRegular text-gray-600">
            Devolução: <Text className="font-barlowRegular text-gray-600">{formatarData(dataPrevistaDevolucao)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}