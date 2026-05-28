import React from 'react';
import { FlatList, View } from 'react-native';
import { CardEmprestimo, type Emprestimo } from '@components';

// Mockando dados para desenvolvimento
const EMPRESTIMOS_MOCK: Emprestimo[] = [
  {
    id: '1',
    livroId: 'l1',
    nomeCliente: 'Ana Lima',
    emailCliente: 'ana@email.com',
    dataLocacao: '2026-03-02T00:00:00.000Z',
    dataPrevistaDevolucao: '2026-03-12T00:00:00.000Z',
    status: 'DEVOLVIDO',
    livro: {
      id: 'l1',
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      isbn: '978-0-00-000000-1',
      editora: 'Editora X',
      ano: 1899,
      quantidadeTotal: 3,
      quantidadeDisponivel: 2,
      categoria: 'ROMANCE',
    },
  },
  {
    id: '2',
    livroId: 'l2',
    nomeCliente: 'Carlos Souza',
    emailCliente: 'carlos@email.com',
    dataLocacao: '2026-04-15T00:00:00.000Z',
    dataPrevistaDevolucao: '2026-04-30T00:00:00.000Z',
    status: 'EM_ANDAMENTO',
    livro: {
      id: 'l2',
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      isbn: '978-0-13-235088-4',
      editora: 'Prentice Hall',
      ano: 2008,
      quantidadeTotal: 2,
      quantidadeDisponivel: 1,
      categoria: 'TECNOLOGIA',
    },
  },
  {
    id: '3',
    livroId: 'l3',
    nomeCliente: 'Maria Costa',
    emailCliente: 'maria@email.com',
    dataLocacao: '2026-03-01T00:00:00.000Z',
    dataPrevistaDevolucao: '2026-03-10T00:00:00.000Z',
    status: 'ATRASADO',
    livro: {
      id: 'l3',
      titulo: 'História do Brasil',
      autor: 'Boris Fausto',
      isbn: '978-0-00-000000-3',
      editora: 'Edusp',
      ano: 1995,
      quantidadeTotal: 1,
      quantidadeDisponivel: 0,
      categoria: 'HISTORIA',
    },
  },
];

const App: React.FC = () => (
  <View className="flex-1 bg-gray-100">
    <FlatList
      data={EMPRESTIMOS_MOCK}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CardEmprestimo emprestimo={item} />}
      contentContainerStyle={{ paddingVertical: 16 }}
    />
  </View>
);

export default App;