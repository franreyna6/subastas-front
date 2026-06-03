import { SubastaResumen } from '@/lib/api/subastas.api';
import { MetodoPago } from '@/lib/api/pagos.api';

export const MOCK_SUBASTAS: SubastaResumen[] = [
  {
    id: 1, tipo: 'en_vivo', estado: 'abierta', categoria: 'platino',
    fecha: new Date().toISOString().slice(0, 10), hora: '14:00:00',
    ubicacion: 'Av. del Libertador 1234, CABA',
    descripcion: 'Colección Arte Contemporáneo',
    totalItems: 12, precioBaseMinimo: 125000,
  },
  {
    id: 2, tipo: 'proxima', estado: 'abierta', categoria: 'oro',
    fecha: '2026-07-22', hora: '16:00:00',
    ubicacion: 'Av. del Libertador 1234, CABA',
    descripcion: 'Autos Clásicos — Julio 2026',
    totalItems: 8, precioBaseMinimo: 300000,
  },
  {
    id: 3, tipo: 'proxima', estado: 'abierta', categoria: 'plata',
    fecha: '2026-08-01', hora: '10:00:00',
    ubicacion: 'Hotel Sheraton Piso 12, CABA',
    descripcion: 'Joyas y Relojes de Lujo',
    totalItems: 5, precioBaseMinimo: 480000,
  },
  {
    id: 4, tipo: 'proxima', estado: 'abierta', categoria: 'comun',
    fecha: '2026-08-15', hora: '11:00:00',
    ubicacion: 'Palais de Glace, CABA',
    descripcion: 'Arte y Antigüedades',
    totalItems: 20, precioBaseMinimo: 15000,
  },
  {
    id: 5, tipo: 'cerrada', estado: 'cerrada', categoria: 'especial',
    fecha: '2026-05-10', hora: '11:00:00',
    ubicacion: 'Palermo, CABA',
    descripcion: 'Colección Privada — Mayo 2026',
    totalItems: 7, precioBaseMinimo: 0,
  },
];

export const MOCK_STATS = {
  subastas:     9,
  ganadas:      3,
  totalGastado: 1358000,
};

export const MOCK_PAGOS: MetodoPago[] = [
  { id: 1, tipo: 'transferencia', detalle: 'Banco Santander — CBU: 0720456789012345678901 — Caja de Ahorro', fechaAlta: '2026-01-10T10:00:00' },
  { id: 2, tipo: 'transferencia', detalle: 'Banco Galicia — Alias: valentina.prueba.pago — Titular: Valentina Prueba', fechaAlta: '2026-02-15T10:00:00' },
  { id: 3, tipo: 'cheque',        detalle: 'Cheque Nro. 00987654 — Banco Nación — Monto: $500.000', fechaAlta: '2026-03-01T10:00:00' },
  { id: 4, tipo: 'efectivo',      detalle: 'Efectivo entregado en sede antes del inicio de la subasta', fechaAlta: '2026-04-20T10:00:00' },
];
