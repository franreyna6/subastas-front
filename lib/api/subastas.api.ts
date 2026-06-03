import { api } from './apiClient';

export interface SubastaResumen {
  id: number;
  categoria: string;
  estado: string;
  tipo: 'en_vivo' | 'proxima' | 'cerrada';
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion: string;
  totalItems: number;
  precioBaseMinimo: number;
}

export interface CatalogoItem {
  id: number;
  producto: number;
  precioBase: number;
  comision: number;
  subastado: string;
}

export interface CatalogoDetalle {
  catalogoId: number;
  descripcion: string;
  items: CatalogoItem[];
}

export const subastasApi = {
  listar: () => api.get<SubastaResumen[]>('/api/subastas'),
  getCatalogo: (id: number) => api.get<CatalogoDetalle>(`/api/subastas/${id}/catalogo`),
};
