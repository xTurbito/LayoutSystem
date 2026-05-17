import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../../../api/auth";
import { getApiError } from "../../../api/errors";
import type { ChangePasswordDto, UpdateProfileDto } from "../type";

export function useProfileMutation() {
    const queryClient = useQueryClient();

    const updateInfo = useMutation({
        mutationFn: (data: UpdateProfileDto) => authApi.updateProfile(data),
        onSuccess: () => {
            toast.success('Información actualizada correctamente');
            queryClient.invalidateQueries({ queryKey: ['profile'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['user'], exact: false });
        },
        onError: (error) => {
            toast.error(getApiError(error, 'Error al actualizar la información'));
        },
    })

    const changePassword = useMutation({
        mutationFn: (data: ChangePasswordDto) => authApi.changePassword(data),
        onSuccess: () => {
            toast.success('Contraseña actualizada. Inicia sesión de nuevo.');
        },
        onError: (error) => {
            toast.error(getApiError(error, 'Error al actualizar la contraseña'));
        },
    })

    return { updateInfo, changePassword }
}