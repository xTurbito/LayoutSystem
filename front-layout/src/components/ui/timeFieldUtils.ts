// Genera "HH:mm" desde `desde` hasta `hasta` (inclusive) cada `pasoMinutos`.
export function generarOpcionesHora(desde: string, hasta: string, pasoMinutos = 15): string[] {
  const [hDesde, mDesde] = desde.split(':').map(Number);
  const [hHasta, mHasta] = hasta.split(':').map(Number);
  const inicioMin = hDesde * 60 + mDesde;
  const finMin = hHasta * 60 + mHasta;

  const opciones: string[] = [];
  for (let min = inicioMin; min <= finMin; min += pasoMinutos) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    opciones.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return opciones;
}
