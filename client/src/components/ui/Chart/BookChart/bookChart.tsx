"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../chart"

// Criação de dados - Mockado
const chartData = [
  { categoria: "Romance", quantidade: 245, fill: "var(--color-romance)" },
  { categoria: "Tecnologia", quantidade: 315, fill: "var(--color-tecnologia)" },
  { categoria: "História", quantidade: 185, fill: "var(--color-historia)" },
  { categoria: "Ciências", quantidade: 270, fill: "var(--color-ciencias)" },
  { categoria: "Infantil", quantidade: 230, fill: "var(--color-infantil)" },
]

// Configuração de cores personalizadas para cada barra
const chartConfig = {
  quantidade: {
    label: "Livros",
  },
  romance: {
    label: "Romance",
    color: "#c20a0a", // Cor vermelho rosa para Romance
  },
  tecnologia: {
    label: "Tecnologia",
    color: "#3187f6", // Cor  azul tech para Tecnologia
  },
  historia: {
    label: "História",
    color: "#6a00dc", // Roxo mais claro para História
  },
  ciencias: {
    label: "Ciências",
    color: "#3bf30d", // Verde bala para Ciências
  },
  infantil: {
    label: "Infantil",
    color: "#ffcd07", // Amarelo vibrante para Infantil
  },
} satisfies ChartConfig

export function BookChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-zinc-700">Livros por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />

                {/* Eixo X - Categorias */}
                <XAxis
                  dataKey="categoria"
                  tickLine={true}
                  tickMargin={10}
                  axisLine={true}
                  tick={{ fontSize: 18, fill: "#71717a" }}
                />

                {/* Eixo Y - Quantidades */}
                <YAxis
                  tickLine={true}
                  axisLine={true}
                  tickMargin={10}
                  tick={{ fontSize: 18, fill: "#71717a" }}
                />

                {/* Tooltip do Shadcn ao passar o rato */}
                <ChartTooltip content={<ChartTooltipContent nameKey="categoria" hideIndicator={false} />} />

                {/* Barras do gráfico aplicando as cores mapeadas */}
                <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}