import { Request , Response } from 'express';
import { Citi, Crud } from "../global";
import prisma from "@database"
import { StatusEmprestimo, Emprestimo } from '@prisma/client';

// Calcula o status do empréstimo 
export const calcularStatus = (emprestimo: Emprestimo): StatusEmprestimo => {
    if (emprestimo.status === "DEVOLVIDO") return "DEVOLVIDO";
    if (new Date() > new Date(emprestimo.dataPrevistaDevolucao)) return "ATRASADO";
    return "EM_ANDAMENTO";
};

function isEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

class LoanController implements Crud {
    constructor(
        private readonly citi = new Citi("Emprestimo"),
        private readonly citiLivro = new Citi("Livro")
    ) {}

    // Post /loans
    create = async ( request: Request, response: Response) => {
        const { livroId, nomeCliente, emailCliente, dataPrevistaDevolucao } = request.body;

        const isAnyUndefined = this.citi.areValuesUndefined(
            livroId,
            nomeCliente,
            emailCliente,
            dataPrevistaDevolucao
        );

        if (isAnyUndefined) {
            return response.status(400).json({ error: "Todos os campos são obrigatórios." });
        }

        if (!isEmailValido(emailCliente)) {
            return response.status(400).json({ error: "Email do cliente é inválido." });
        }

        const dataLocacao = new Date();
        const dataDevolucao = new Date(dataPrevistaDevolucao);

        if (isNaN(dataDevolucao.getTime())) {
            return response.status(400).json({ error: "Data prevista de devolução é inválida." });
        }

        if (dataDevolucao <= dataLocacao) {
            return response.status(400).json({ error: "Data prevista de devolução deve ser posterior à data de locação." });
        }

        // Verificar se o Livro existe
        const { value: livroExistente } = await this.citiLivro.findById(livroId);
    
        if (!livroExistente) {
            return response.status(404).json({ error: "Livro não encontrado." });
        }
        
        // Verificar se o Livro está disponível para empréstimo
        if (livroExistente.quantidadeDisponivel <= 0) {
            return response.status(409).json({ error: "Livro indisponível para empréstimo." });
        }

        // Criar o objeto do novo empréstimo
        const novoEmprestimo = {
            livroId,
            nomeCliente,
            emailCliente,
            dataLocacao,
            dataPrevistaDevolucao: dataDevolucao,
            status: "EM_ANDAMENTO" as StatusEmprestimo,
        };

        const { httpStatus, message } = await this.citi.insertIntoDatabase(novoEmprestimo);

        if (httpStatus !== 201) {
            return response.status(httpStatus).json({ error: message });
        }

        // Decrementar a quantidade disponível do livro
        await prisma.livro.update({
            where: { id: livroId },
            data: { quantidadeDisponivel: { decrement: 1 } },
        });

        return response.status(201).json({ message });
        
    };

    // Get /loans
    get = async (request: Request, response: Response) => {
        const { nomeCliente } = request.query;

        // Prisma direto: Citi.getAll não suporta include
        const emprestimos = await prisma.emprestimo.findMany({
            include: { livro: true }
        });

        let emprestimosFiltered = emprestimos;

        if (nomeCliente) {
            emprestimosFiltered = emprestimosFiltered.filter((emp) =>
                emp.nomeCliente.toLowerCase().includes(String(nomeCliente).toLowerCase())
            );
        }

        const resultado = emprestimosFiltered.map((emp) => {
            emp.status = calcularStatus(emp);
            return emp;
        });

        return response.status(200).json(resultado);
    };

    // Patch /loans/:id/devolver
    update = async (request: Request, response: Response) => {
        const { id } = request.params;
 
        // Busca o empréstimo
        const { value: emprestimo } = await this.citi.findById(id);

        if (!emprestimo) {
            return response.status(404).json({ message: "Empréstimo não encontrado." });
        }
    
        if (emprestimo.status === "DEVOLVIDO") {
            return response.status(409).json({ message: "Este empréstimo já foi finalizado." });
        }
    
        await this.citi.updateValue(id, { status: "DEVOLVIDO" });
    
        // Prisma direto: Citi.updateValue não suporta { increment: 1 } atômico
        await prisma.livro.update({
            where: { id: emprestimo.livroId },
            data: { quantidadeDisponivel: { increment: 1 } },
        });
    
        return response.status(200).json({ message: "Empréstimo finalizado com sucesso." });
    };

    //Delete /loans/:id
    delete = async (request: Request, response: Response) => {
        const { id } = request.params;
    
        // Busca o empréstimo 
        const { value: emprestimo } = await this.citi.findById(id);

        if (!emprestimo) {
            return response.status(404).json({ message: "Empréstimo não encontrado." });
        }
    
        // Só incrementa se ainda não estava devolvido (evita incrementar duas vezes)
        const deveIncrementar = emprestimo.status !== "DEVOLVIDO";
    
        // Remove — via Citi
        const { httpStatus, messageFromDelete } = await this.citi.deleteValue(id);

        if (httpStatus !== 200) {
            return response.status(httpStatus).json({ messageFromDelete });
        }

        // Prisma direto: Citi
        if (deveIncrementar) {
            await prisma.livro.update({
                where: { id: emprestimo.livroId },
                data: { quantidadeDisponivel: { increment: 1 } },
            });
        }

        return response.status(200).json({ messageFromDelete });

    };

    getById = async (request: Request, response: Response) => {
        const { id } = request.params;
        const { httpStatus, value } = await this.citi.findById(id);
        return response.status(httpStatus).json(value);
    };
}

export default new LoanController();