import { z } from 'zod';

// Reglas de complejidad de contraseña — compartidas por los formularios de usuario y perfil.
export const passwordComplexity = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe tener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'Debe tener al menos un carácter especial');
