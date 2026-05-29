import type { Loan} from "./index";

export const latestLoansMock: Loan[] = [
  {
    id: 1,
    book: "Clean Code",
    client: "João Silva",
    loanDate: "20/04/2026",
    returnDate: "27/04/2026",
    status: "Em andamento",
  },
  {
    id: 2,
    book: "O Pequeno Príncipe",
    client: "Maria Santos",
    loanDate: "18/04/2026",
    returnDate: "25/04/2026",
    status: "Atrasado",
  },
  {
    id: 3,
    book: "Dom Casmurro",
    client: "Pedro Costa",
    loanDate: "15/04/2026",
    returnDate: "22/04/2026",
    status: "Devolvido",
  },
  {
    id: 4,
    book: "JavaScript: The Good Parts",
    client: "Ana Oliveira",
    loanDate: "22/04/2026",
    returnDate: "29/04/2026",
    status: "Em andamento",
  },
  {
    id: 5,
    book: "Refactoring",
    client: "Carla Mendes",
    loanDate: "24/04/2026",
    returnDate: "01/05/2026",
    status: "Em andamento",
  },
  {
    id: 6,
    book: "Capitães da Areia",
    client: "Lucas Lima",
    loanDate: "19/04/2026",
    returnDate: "26/04/2026",
    status: "Atrasado",
  },
];