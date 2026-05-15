import { z } from 'zod'

  export const roleSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    description: z.string().max(200, 'Máximo 200 caracteres'),
  })

  export type RoleFormValues = z.infer<typeof roleSchema>
