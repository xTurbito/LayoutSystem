import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Lock, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../schemas/auth';

export function LoginPage() {
  const { login } = useAuth();

  const { register, handleSubmit,formState: { errors, isSubmitting },} = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onError: () => toast.error('Credenciales incorrectas. Intenta de nuevo.'),
  });

  const isLoading = mutation.isPending || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-text tracking-tight">LayoutSystem</h1>
          <p className="text-secondary text-sm mt-0.5">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-text">Iniciar sesión</h2>
            <p className="text-secondary text-sm mt-0.5">Ingresa tus credenciales para continuar</p>
          </div>

          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="px-8 py-6 flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@empresa.com"
              leadingIcon={<User className="w-4 h-4" />}
              errorMessage={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              leadingIcon={<Lock className="w-4 h-4" />}
              errorMessage={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              label={isLoading ? 'Ingresando...' : 'Iniciar sesión'}
              fullWidth
              disabled={isLoading}
              className="mt-1 py-2.5"
            />
          </form>

          <div className="px-8 py-3 bg-bg border-t border-border flex items-center justify-center gap-1.5 text-xs text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            Conexión segura y cifrada
          </div>
        </div>

        <p className="text-center text-xs text-secondary mt-5">
          © {new Date().getFullYear()} LayoutSystem · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
