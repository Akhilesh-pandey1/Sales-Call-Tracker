import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/shared/utils/cn";
import { useUserStatus } from "../hooks/use-user-status";

interface UserStatusButtonProps {
  userId: number;
  isActive: boolean;
}

export function UserStatusButton({ userId, isActive }: UserStatusButtonProps) {
  const { setUserActive, isStatusChangePending, statusChangeErrorMessage } =
    useUserStatus();

  const handleToggleStatus = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    setUserActive(userId, !isActive);
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
  };

  const buttonLabel: string = isActive ? "Deactivate" : "Activate";
  const buttonClassName: string = cn(
    "inline-flex h-8 w-24 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isActive
      ? "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      : "bg-muted font-semibold text-foreground hover:bg-border"
  );

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggleStatus}
        onKeyDown={handleButtonKeyDown}
        disabled={isStatusChangePending}
        className={buttonClassName}
      >
        {buttonLabel}
      </button>
      {statusChangeErrorMessage && (
        <span role="alert" className="block max-w-40 text-right text-xs text-destructive">
          {statusChangeErrorMessage}
        </span>
      )}
    </span>
  );
}
