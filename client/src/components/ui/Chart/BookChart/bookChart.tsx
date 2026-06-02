"use client"

import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart"

type RespostaAnalytics = Record<string, { categoria: string; quantidade: number; fill?: string }[]>;

const chartConfig = {
  quantidade: { label: "Livros" },
  romance: { label: "Romance", color: "#c20a0a" },
  tecnologia: { label: "Tecnologia", color: "#3187f6" },
  historia: { label: "História", color: "#6a00dc" },
  ciencias: { label: "Ciências", color: "#3bf30d" },
  infantil: { label: "Infantil", color: "#ffcd07" },
} satisfies ChartConfig

function formatCategoria(categoria: string) {
  const categorias: Record<string, string> = {
    ROMANCE: "Romance",
    TECNOLOGIA: "Tecnologia",
    HISTORIA: "História",
    CIENCIAS: "Ciências",
    INFANTIL: "Infantil",
  }
  return categorias[categoria] ?? categoria
}

export function BookChart() {
  const [dadosGerais, setDadosGerais] = useState<RespostaAnalytics>({})
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Usando o Axios para conectar 
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true)
        const response = await api.get<RespostaAnalytics>("/loans/analytics")
        const data = response.data

        // Injeta as propriedades de cor (fill) dinamicamente baseada na categoria
        Object.keys(data).forEach((semestre) => {
          data[semestre] = data[semestre].map((item) => {
            const categoriaFormatada = formatCategoria(item.categoria)
            const cleanKey = categoriaFormatada.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            return {
              ...item,
              categoria: categoriaFormatada,
              fill: `var(--color-${cleanKey})`
            }
          })
        })

        setDadosGerais(data)

        // Define o primeiro semestre encontrado como o padrão ativo no select
        const semestresDisponiveis = Object.keys(data)
        if (semestresDisponiveis.length > 0) {
          setSelectedSemester(semestresDisponiveis[0])
        }
      } catch (error) {
        console.error("Erro ao buscar dados do analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Filtra os dados conforme o semestre selecionado no select
  const filteredData = dadosGerais[selectedSemester] || []
  const listaDeSemestres = Object.keys(dadosGerais)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <CardTitle className="text-2xl font-semibold text-zinc-700">
            Empréstimos por Categoria
          </CardTitle>
          
          {!loading && listaDeSemestres.length > 0 && (
            <div className="text-xl font-semibold text-zinc-500 flex items-center">
              Período
              <select 
                className="m-2 text-[16px] font-semibold text-black rounded-md border border-zinc-200 p-1 bg-white cursor-pointer"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {listaDeSemestres.map((semestre) => (
                  <option key={semestre} value={semestre}>
                    {semestre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="text-zinc-500 font-medium">Buscando dados no servidor...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-zinc-400">Nenhum dado populado no período.</div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={filteredData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="categoria" tickLine={true} tickMargin={10} axisLine={true} tick={{ fontSize: 18, fill: "#71717a" }} />
                <YAxis allowDecimals={false} tickLine={true} axisLine={true} tickMargin={10} tick={{ fontSize: 18, fill: "#71717a" }} />
                <ChartTooltip content={<ChartTooltipContent nameKey="categoria" hideIndicator={false} />} />
                <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
