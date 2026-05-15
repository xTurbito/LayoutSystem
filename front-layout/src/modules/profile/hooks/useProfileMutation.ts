import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { authApi } from "../../../api/auth";
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
        onError: (error: AxiosError<string>) => {
            toast.error(error.response?.data ?? 'Error al actualizar la información');
        },
    })

    const changePassword = useMutation({
        mutationFn: (data: ChangePasswordDto) => authApi.changePassword(data),
        onSuccess: () => {
            toast.success('Contraseña actualizada correctamente');
        },
        onError: (error: AxiosError<string>) => {
            toast.error(error.response?.data ?? 'Error al actualizar la contraseña');
        },
    })

    return { updateInfo, changePassword }
}