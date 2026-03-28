import axios from 'axios';

/**
 * Cliente HTTP configurado para comunicação com a API backend.
 * Base URL aponta para servidor de desenvolvimento local.
 */
export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
});
