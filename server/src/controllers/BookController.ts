import { Request, Response } from "express";
import {Citi, Crud} from "../global"
import prisma from "@database";

class BookController implements Crud{
    constructor(private readonly citi = new Citi("Livro")) {}
    // Definindo que create vai receber essas entidades do body
    create = async (request: Request, response: Response) => {
        const {titulo, autor, isbn, editora, ano, quantidadeTotal, categoria} = request.body;

        // Passa os campos pro arquivo do citi verificar se há algum vazio.
        const isAnyUndefined = this.citi.areValuesUndefined(
            titulo, autor, isbn, editora, ano, quantidadeTotal, categoria
    );
    // Validação, impedindo que algo esteja em branco.
    if (isAnyUndefined){
        return response.status(400).send({message:"Todos os campos são obrigatórios."});
    }

    // Validação, garantindo tamanho requisitado do ISBN.
    const isbnLength = isbn.toString().trim().length;
    if (isbnLength != 10 && isbnLength != 13){
        return response.status(400).send({message:"O ISBN deve ter 10 ou 13 dígitos."})
    }

    const newBook = { 
        titulo, autor, 
        isbn, editora, 
        ano:Number(ano), quantidadeTotal:Number(quantidadeTotal), 
        quantidadeDisponivel:Number(quantidadeTotal), categoria
    };

    const {httpStatus, message} = await this.citi.insertIntoDatabase(newBook);
    
    // Retorna resposta final do banco de dados.
    return response.status(httpStatus).send({message});
    };

    // Criação do get
    get = async (request: Request, response: Response) => {
        // Parâmetros opcionais.
        const { titulo, autor, categoria } = request.query;

        const {httpStatus, values} = await this.citi.getAll();

        if(httpStatus !== 200){
            return response.status(httpStatus).send(values);
        }
    
        let booksFiltered = values;

        // Verifica se tem parâmetro opcional e filtra os livros pelo parâmetro.
        if (titulo){
            booksFiltered = booksFiltered.filter((book:any) =>
            book.titulo.toLowerCase().includes(String(titulo).toLowerCase()));
        }
        if (autor){
            booksFiltered = booksFiltered.filter((book:any) =>
            book.autor.toLowerCase().includes(String(autor).toLowerCase()));
        }
        if(categoria){
            booksFiltered = booksFiltered.filter((book)=>
            book.categoria.toLowerCase().includes(String(categoria).toLowerCase()));
        }

        return response.status(200).send(booksFiltered);
    };


    delete = async (request:Request, response: Response) => {
        // Definindo que vamos deletar pelo id do livro.
        const {id} = request.params;
        const { httpStatus, messageFromDelete} = await this.citi.deleteValue(id);
        return response.status(httpStatus).send({messageFromDelete});
    };

    getById = async(request:Request, response:Response) =>{
        // Passando o id.
        const {id} = request.params;
        
        // Procurar o livro pelo id mencionado.
        const {httpStatus, value} = await this.citi.findById(id);
        return response.status(httpStatus).send(value);
    };

     reduceQuantity = async (request: Request, response: Response) => {
        const { id } = request.params;
        const { quantidadeARemover } = request.body;

        try {
            if (quantidadeARemover === undefined) {
                return response.status(400).send({
                    message: "Quantidade a remover é obrigatória."
                });
            }

            const qtdRemover = Number(quantidadeARemover);

            if (isNaN(qtdRemover) || qtdRemover <= 0) {
                return response.status(400).send({
                    message: "Quantidade deve ser um número positivo."
                });
            }

            const { value: livro } = await this.citi.findById(id);

            if (!livro) {
                return response.status(404).send({
                    message: "Livro não encontrado."
                });
            }

            if (qtdRemover > livro.quantidadeDisponivel) {
                return response.status(409).send({
                    message: `Quantidade indisponível. Você tem ${livro.quantidadeDisponivel} livros disponíveis.`
                });
            }

            await prisma.livro.update({
                where: { id },
                data: {
                    quantidadeTotal: livro.quantidadeTotal - qtdRemover,
                    quantidadeDisponivel: livro.quantidadeDisponivel - qtdRemover,
                }
            });

            return response.status(200).send({
                message: `${qtdRemover} livro(s) removido(s) com sucesso.`
            });

        } catch (error) {
            console.error("Erro ao reduzir quantidade:", error);
            return response.status(500).send({
                message: "Erro ao reduzir quantidade de livros."
            });
        }
    };
}

export default new BookController();