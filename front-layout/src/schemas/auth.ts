import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().min(1, 'El correo es requerido').regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  })

 export type LoginFormValues = z.infer<typeof loginSchema>