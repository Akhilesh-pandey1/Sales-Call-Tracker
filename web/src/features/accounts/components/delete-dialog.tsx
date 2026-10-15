import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/shared/components/error-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteUser } from "../hooks/use-delete-user";

interface DeleteDialogProps {
  accountId: number;
  accountName: string;
  onClose: () => void;
}

export function DeleteDialog({ accountId, accountName, onClose }: DeleteDialogProps) {
  const { deleteUserAccount, isDeletePending, deleteErrorMessage } = useDeleteUser();

  const handleDialogOpenChange = (isOpen: boolean): void => {
    if (!isOpen && !isDeletePending) {
      onClose();
    }
  };

  const handleConfirmDelete = (): void => {
    deleteUserAccount(accountId, onClose);
  };

  return (
    <Dialog open onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogTitle className="text-lg font-bold tracking-tight">
          Delete {accountName}?
        </DialogTitle>
        <DialogDescription>
          This permanently removes {accountName} and all their calls. Cannot be undone.
        </DialogDescription>
        {deleteErrorMessage ? <ErrorAlert message={deleteErrorMessage} /> : null}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl text-sm font-semibold"
            disabled={isDeletePending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl text-sm font-semibold"
            disabled={isDeletePending}
            onClick={handleConfirmDelete}
          >
            {isDeletePending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
