import { z } from 'zod';
import { passwordComplexity } from '../../schemas/password';

export interface UserFormValues {
    name: string;
    email: string;
    roleId: string;
    password: string;
    confirmPassword: string;
    isActive?: boolean;
}

  const baseUserSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    email: z.string().min(1, 'El correo es requerido').email('Correo inválido').max(150, 'Máximo 150 caracteres'),
    roleId: z.string({ error: 'El rol es requerido' }).min(1, 'El rol es requerido'),
    confirmPassword: z.string(),
  })

  export const createUserSchema = baseUserSchema.extend({
    password: passwordComplexity,
  }).refine(d => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

  export const updateUserSchema = baseUserSchema.extend({
    password: z.union([z.literal(''), passwordComplexity]),
    isActive: z.boolean().optional(),
  }).refine(d => !d.password || d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

  export type CreateUserFormValues = z.infer<typeof createUserSchema>
  export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
