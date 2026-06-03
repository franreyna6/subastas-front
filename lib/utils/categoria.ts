export const CATEGORIA_ORDEN: Record<string, number> = {
  comun:    0,
  plata:    1,
  oro:      2,
  especial: 3,
  platino:  4,
};

export const CATEGORIA_COLOR: Record<string, string> = {
  platino:  '#A0522D',
  oro:      '#B8860B',
  plata:    '#708090',
  especial: '#6A0DAD',
  comun:    '#1A3A5C',
};

export const CATEGORIA_ICON: Record<string, string> = {
  platino:  'diamond-outline',
  oro:      'car-sport-outline',
  plata:    'color-palette-outline',
  especial: 'star-outline',
  comun:    'pricetag-outline',
};

export const CATEGORIA_PROXIMA: Record<string, string> = {
  comun:    'plata',
  plata:    'oro',
  oro:      'especial',
  especial: 'platino',
};

export const CATEGORIA_REQUISITOS: Record<string, string[]> = {
  plata: [
    'Participar en al menos 5 subastas',
    'Verificar un método de pago',
    'Sin sanciones activas',
  ],
  oro: [
    'Completar al menos 20 subastas',
    'Calificación promedio ≥ 4.0',
    'Cuenta activa por más de 6 meses',
  ],
  especial: [
    'Historial de compras acumulado ≥ $500.000',
    'Invitación del equipo de Subastas',
    'Sin infracciones en el último año',
  ],
  platino: [
    'Solo por gestión administrativa',
    'Cliente VIP verificado',
  ],
};

export function puedeParticipar(
  categoriaUsuario: string | undefined,
  categoriaSubasta: string,
): boolean {
  const u = CATEGORIA_ORDEN[categoriaUsuario ?? 'comun'] ?? 0;
  const s = CATEGORIA_ORDEN[categoriaSubasta] ?? 0;
  return u >= s;
}
