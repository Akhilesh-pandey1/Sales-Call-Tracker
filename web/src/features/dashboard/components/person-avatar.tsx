import { getPersonInitials } from "../utils/format";

interface PersonAvatarProps {
  name: string;
}

export function PersonAvatar({ name }: PersonAvatarProps) {
  const initials: string = getPersonInitials(name);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {initials}
    </div>
  );
}
