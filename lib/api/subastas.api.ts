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

export interface HistorialItem {
  subastaId: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  estado: 'GANADA' | 'PARTICIPÓ';
  importe: number;
}

export interface PujoItem {
  numeropostor: string;
  importe: number;
  esYo: boolean;
  ganador: boolean;
}

export interface ResultadoSubasta {
  subastaId: number;
  descripcion: string;
  fecha: string;
  categoria: string;
  estado: 'GANADA' | 'PARTICIPÓ' | 'CERRADA';
  miImporte: number | null;
  pujos: PujoItem[];
}

export interface UnirseResponse {
  asistenteId: number;
  numeropostor: number;
  puedePublicar: boolean;
}

export interface EstadoPujo {
  numPostor: number;
  importe: number;
  ganador: boolean;
}

export interface ItemActual {
  itemId: number;
  numero: number;
  descripcion: string;
  precioBase: number;
  mejorOferta: number | null;
  pujos: EstadoPujo[];
}

export interface EstadoSubasta {
  subastaId: number;
  estado: string;
  totalItems: number;
  itemActual: ItemActual | null;
}

export interface SolicitudItem {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  estado: string;
  precioBaseSugerido: number | null;
  precioBaseOficial: number | null;
  comision: number | null;
  motivoRechazo: string;
  fechaSolicitud: string;
}

export const subastasApi = {
  listar:      ()           => api.get<SubastaResumen[]>('/api/subastas'),
  getCatalogo: (id: number) => api.get<CatalogoDetalle>(`/api/subastas/${id}/catalogo`),
  historial:   ()           => api.get<HistorialItem[]>('/api/perfil/historial'),
  resultado:   (id: number) => api.get<ResultadoSubasta>(`/api/subastas/${id}/resultado`),
  unirse:      (id: number) => api.post<UnirseResponse>(`/api/subastas/${id}/unirse`, {}),
  estado:      (id: number) => api.get<EstadoSubasta>(`/api/subastas/${id}/estado`),
  pujar:       (subastaId: number, itemId: number, importe: number) =>
                 api.post(`/api/subastas/${subastaId}/items/${itemId}/pujar`, { importe }),
};

export const solicitudesApi = {
  listar:             ()                          => api.get<SolicitudItem[]>('/api/solicitudes'),
  crear:              (body: {
                        titulo: string;
                        categoria: string;
                        descripcion: string;
                        precioBaseSugerido: number | null;
                        archivoComprobante: string | null;
                        declaracionJurada: boolean;
                      })                          => api.post<SolicitudItem>('/api/solicitudes', body),
  aceptarCondiciones: (id: number)                => api.put(`/api/solicitudes/${id}/aceptar`),
  rechazarCondiciones:(id: number)                => api.put(`/api/solicitudes/${id}/rechazar-condiciones`),
};
