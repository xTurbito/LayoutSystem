import { z } from 'zod';


const passwordComplexity = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe tener al menos un carácter especial')


export const PasswordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    password: passwordComplexity,
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

export type ChangePasswordFormValues = z.infer<typeof PasswordSchema>

export const ProfileInfoSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    email: z.string().min(1, 'El correo es requerido').email({ message: 'Correo inválido' }).max(150, 'Máximo 150 caracteres'),
})

export type ProfileInfoFormValues = z.infer<typeof ProfileInfoSchema>
