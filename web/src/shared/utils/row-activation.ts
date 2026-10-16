import type { KeyboardEvent } from "react";

export function handleRowActivationKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onActivate: () => void
): void {
  const enterKey: string = "Enter";
  const spaceKey: string = " ";
  const isEventFromElementItself: boolean = event.target === event.currentTarget;
  if (!isEventFromElementItself) {
    return;
  }
  const isActivationKey: boolean = event.key === enterKey || event.key === spaceKey;
  if (!isActivationKey) {
    return;
  }
  event.preventDefault();
  onActivate();
}
