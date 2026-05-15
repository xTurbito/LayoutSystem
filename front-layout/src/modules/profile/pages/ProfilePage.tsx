import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"
import { useProfile } from "../hooks/useProfile"
import { useProfileMutation } from "../hooks/useProfileMutation"
import { PasswordSchema, ProfileInfoSchema } from "../schemas"
import type { ChangePasswordFormValues, ProfileInfoFormValues } from "../schemas"

export default function ProfilePage() {

  const { profile, isLoading, isError } = useProfile();
  const { updateInfo, changePassword } = useProfileMutation();

  const infoForm = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(ProfileInfoSchema),
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
    },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
  })

  const onUpdateInfo = (data: ProfileInfoFormValues) => {
    updateInfo.mutate({ name: data.name, email: data.email })
  }

  const onChangePassword = (data: ChangePasswordFormValues) => {
    changePassword.mutate({ currentPassword: data.currentPassword, newPassword: data.password }, {
      onSuccess: () => passwordForm.reset(),
    })
  }

  return (
    <div className="w-full ">

      {isError ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-secondary">No se pudo cargar el perfil.</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-surface border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="h-5 bg-border rounded w-1/4" />
              </div>
              <div className="flex gap-4 px-6 py-6">
                <div className="h-10 bg-border rounded flex-1" />
                <div className="h-10 bg-border rounded flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-3 mb-6">
            <h1 className="text-2xl font-black text-text mb-1">Mis Datos</h1>
            <p className="text-secondary text-base font-normal">
              Actualiza tu usuario aquí
            </p>
          </div>

          <div className="flex flex-col gap-10">
            <form onSubmit={infoForm.handleSubmit(onUpdateInfo)}>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <h2 className="text-lg font-bold">Información Personal</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 px-6 pt-4 pb-6 bg-bg/50 w-full">
                  <Input label="Nombre Completo" type="text" containerClassName="flex-1" {...infoForm.register('name')} errorMessage={infoForm.formState.errors.name?.message} />
                  <Input label="Email" type="email" containerClassName="flex-1" {...infoForm.register('email')} errorMessage={infoForm.formState.errors.email?.message} />
                </div>
                <div className="flex justify-end p-6">
                  <Button label="Guardar Cambios" type="submit" isLoading={updateInfo.isPending} />
                </div>
              </div>
            </form>

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b border-border">
                  <h2 className="text-lg font-bold">Configuración de Seguridad</h2>
                </div>
                <div className="flex flex-col gap-4 px-6 pt-4 pb-6 bg-bg/50 w-full">
                  <Input label="Contraseña Actual" type="password" {...passwordForm.register('currentPassword')} errorMessage={passwordForm.formState.errors.currentPassword?.message} />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input label="Nueva Contraseña" type="password" containerClassName="flex-1" {...passwordForm.register('password')} errorMessage={passwordForm.formState.errors.password?.message} />
                    <Input label="Confirmar Nueva Contraseña" type="password" containerClassName="flex-1" {...passwordForm.register('confirmPassword')} errorMessage={passwordForm.formState.errors.confirmPassword?.message} />
                  </div>
                </div>
                <div className="flex justify-end p-6">
                  <Button label="Actualizar Contraseña" type="submit" isLoading={changePassword.isPending} />
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
