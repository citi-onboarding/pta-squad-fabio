export function formatarDataBR(data: string | Date): string {
  const date = typeof data === "string" ? new Date(data) : data;
  
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}