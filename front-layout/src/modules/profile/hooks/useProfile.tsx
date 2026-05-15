import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../../api/auth";


export function useProfile(){
    const { data, isLoading, isError } = useQuery({
        queryKey: ['profile'],
        queryFn: authApi.getMe
    });

    return { profile: data, isLoading, isError };
}