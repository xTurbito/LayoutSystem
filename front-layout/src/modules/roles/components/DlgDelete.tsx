import ModalShell from "../../../components/ui/ModalShell";
import { Trash } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { RoleItem } from "../types";
import { useRoleMutation } from "../hooks/useRoleMutation";


interface DlgDeletePropos {
    open: boolean;
    onClose: () => void;
    role?: RoleItem;
}


export default function DlgDelete({open, onClose,role}: DlgDeletePropos) {



    const { remove } = useRoleMutation(onClose);
    
    const onSubmit = () => {
        if (role) remove.mutate(role.id);
    }
    
    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Eliminar Registro"
            icon={<Trash />}
            description={`Eliminar el rol de ${role?.name}`} 
        >
            <div className="flex flex-col gap-3">
                <p>¿Estás seguro de eliminar el registro? Esta acción no se podrá deshacer.</p>
                <Button
                 type="button"
                 onClick={onSubmit}
                 label="Eliminar"
                 variant="danger"
                 fullWidth
                 isLoading={remove.isPending}
                 className="mt-1"
                />
            </div>
        </ModalShell>
    )
}
