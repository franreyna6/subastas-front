import { api } from './apiClient';

export type TipoPago = 'transferencia' | 'cheque' | 'efectivo';

export interface MetodoPago {
  id: number;
  tipo: TipoPago;
  detalle: string;
  fechaAlta: string;
}

export const pagosApi = {
  listar: () => api.get<MetodoPago[]>('/api/pagos'),

  agregar: (tipo: TipoPago, detalle: string) =>
    api.post<MetodoPago>('/api/pagos', { tipo, detalle }),

  eliminar: (id: number) => api.delete<{ mensaje: string }>(`/api/pagos/${id}`),
};
