import axios from "axios";
//BaseURL deve ser alterada para o endereço do backend em nuvem.

export const api = axios.create({
  baseURL: "http://localhost:3001",
});