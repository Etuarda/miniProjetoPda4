import axios from 'axios';

/**
 * Cliente HTTP configurado para comunicação com a API backend.
 * A base URL vem de variável de ambiente Vite para suportar deploy em produção.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});
