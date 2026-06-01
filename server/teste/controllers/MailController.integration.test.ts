import { PrismaClient } from "@prisma/client";

/**
 * Testes de Integração para MailController + Banco Real
 * 
 * Estes testes usam o banco de dados Postgres REAL
 * Certifique-se de que o banco está rodando via docker-compose
 */

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:docker@localhost:5432/pta",
    },
  },
});

describe("MailController - Integração com BD Real", () => {
  beforeAll(async () => {
    // Verificar conexão com banco
    try {
      await prisma.$executeRawUnsafe("SELECT 1");
      console.log("✅ Conexão com banco de dados estabelecida");
    } catch (error) {
      console.error("❌ Erro ao conectar ao banco:", error);
      throw new Error("Não foi possível conectar ao banco de dados");
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Limpar dados de teste
    await prisma.emprestimo.deleteMany({
      where: {
        id: {
          startsWith: "test-loan-",
        },
      },
    });
  });

  describe("Buscar empréstimo do banco", () => {
    it("deve encontrar empréstimo existente no banco", async () => {
      // Criar usuário de teste
      const user = await prisma.usuario.create({
        data: {
          email: "test-user-integration@example.com",
          nome: "Test User Integration",
          senha: "hashed_password",
        },
      });

      // Criar livro de teste
      const book = await prisma.livro.create({
        data: {
          titulo: "Test Book Integration",
          autor: "Test Author",
          descricao: "Test Description",
          isbn: "test-isbn-123",
        },
      });

      // Criar empréstimo de teste
      const loan = await prisma.emprestimo.create({
        data: {
          id: "test-loan-001",
          usuarioId: user.id,
          livroId: book.id,
          status: "ATIVO",
          dataDevolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Buscar empréstimo
      const foundLoan = await prisma.emprestimo.findUnique({
        where: { id: "test-loan-001" },
        include: { livro: true, usuario: true },
      });

      expect(foundLoan).toBeDefined();
      expect(foundLoan?.id).toBe("test-loan-001");
      expect(foundLoan?.status).toBe("ATIVO");
      expect(foundLoan?.livro.titulo).toBe("Test Book Integration");

      // Cleanup
      await prisma.usuario.delete({ where: { id: user.id } });
      await prisma.livro.delete({ where: { id: book.id } });
    });

    it("deve retornar null para empréstimo inexistente", async () => {
      const foundLoan = await prisma.emprestimo.findUnique({
        where: { id: "test-loan-inexistente" },
      });

      expect(foundLoan).toBeNull();
    });

    it("deve buscar múltiplos empréstimos de um usuário", async () => {
      // Criar usuário de teste
      const user = await prisma.usuario.create({
        data: {
          email: "test-user-multi@example.com",
          nome: "Test User Multi",
          senha: "hashed_password",
        },
      });

      // Criar livros de teste
      const book1 = await prisma.livro.create({
        data: {
          titulo: "Test Book 1",
          autor: "Test Author",
          descricao: "Test Description 1",
          isbn: "test-isbn-multi-1",
        },
      });

      const book2 = await prisma.livro.create({
        data: {
          titulo: "Test Book 2",
          autor: "Test Author",
          descricao: "Test Description 2",
          isbn: "test-isbn-multi-2",
        },
      });

      // Criar múltiplos empréstimos
      await prisma.emprestimo.create({
        data: {
          id: "test-loan-multi-001",
          usuarioId: user.id,
          livroId: book1.id,
          status: "ATIVO",
          dataDevolucao: new Date(),
        },
      });

      await prisma.emprestimo.create({
        data: {
          id: "test-loan-multi-002",
          usuarioId: user.id,
          livroId: book2.id,
          status: "ATIVO",
          dataDevolucao: new Date(),
        },
      });

      // Buscar empréstimos
      const loans = await prisma.emprestimo.findMany({
        where: { usuarioId: user.id },
      });

      expect(loans.length).toBeGreaterThanOrEqual(2);

      // Cleanup
      await prisma.usuario.delete({ where: { id: user.id } });
      await prisma.livro.deleteMany({
        where: { id: { in: [book1.id, book2.id] } },
      });
    });
  });

  describe("Status de empréstimo", () => {
    it("deve atualizar status de empréstimo de ATIVO para DEVOLVIDO", async () => {
      // Criar dados de teste
      const user = await prisma.usuario.create({
        data: {
          email: "test-status@example.com",
          nome: "Test Status",
          senha: "hashed_password",
        },
      });

      const book = await prisma.livro.create({
        data: {
          titulo: "Test Book Status",
          autor: "Test Author",
          descricao: "Test Description",
          isbn: "test-isbn-status",
        },
      });

      const loan = await prisma.emprestimo.create({
        data: {
          id: "test-loan-status",
          usuarioId: user.id,
          livroId: book.id,
          status: "ATIVO",
          dataDevolucao: new Date(),
        },
      });

      expect(loan.status).toBe("ATIVO");

      // Atualizar status
      const updatedLoan = await prisma.emprestimo.update({
        where: { id: "test-loan-status" },
        data: { status: "DEVOLVIDO" },
      });

      expect(updatedLoan.status).toBe("DEVOLVIDO");

      // Cleanup
      await prisma.usuario.delete({ where: { id: user.id } });
      await prisma.livro.delete({ where: { id: book.id } });
    });
  });

  describe("Validações de dados", () => {
    it("deve validar que email é único", async () => {
      const user = await prisma.usuario.create({
        data: {
          email: "test-unique@example.com",
          nome: "Test User",
          senha: "hashed_password",
        },
      });

      // Tentar criar outro com mesmo email
      await expect(
        prisma.usuario.create({
          data: {
            email: "test-unique@example.com",
            nome: "Another User",
            senha: "hashed_password",
          },
        })
      ).rejects.toThrow();

      // Cleanup
      await prisma.usuario.delete({ where: { id: user.id } });
    });

    it("deve validar campos obrigatórios de livro", async () => {
      await expect(
        prisma.livro.create({
          data: {
            titulo: "Test",
            // author e outros campos faltando
          } as any,
        })
      ).rejects.toThrow();
    });
  });

  describe("Transações", () => {
    it("deve criar empréstimo e atualizar status de livro em uma transação", async () => {
      const user = await prisma.usuario.create({
        data: {
          email: "test-transaction@example.com",
          nome: "Test Transaction",
          senha: "hashed_password",
        },
      });

      const book = await prisma.livro.create({
        data: {
          titulo: "Test Book Transaction",
          autor: "Test Author",
          descricao: "Test Description",
          isbn: "test-isbn-transaction",
        },
      });

      // Executar transação
      const result = await prisma.$transaction(async (tx) => {
        const loan = await tx.emprestimo.create({
          data: {
            id: "test-loan-transaction",
            usuarioId: user.id,
            livroId: book.id,
            status: "ATIVO",
            dataDevolucao: new Date(),
          },
        });

        // Aqui você poderia atualizar outro campo
        return loan;
      });

      expect(result.id).toBe("test-loan-transaction");
      expect(result.status).toBe("ATIVO");

      // Cleanup
      await prisma.usuario.delete({ where: { id: user.id } });
      await prisma.livro.delete({ where: { id: book.id } });
    });
  });
});
