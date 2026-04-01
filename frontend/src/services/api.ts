import axios from 'axios';

/**
 * Cliente HTTP configurado para comunicação com a API backend.
 * A base URL vem de variável de ambiente Vite para suportar deploy em produção.
 */
const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/g, '');

export const api = axios.create({
  baseURL: `${apiBase}/api/v1`
});
