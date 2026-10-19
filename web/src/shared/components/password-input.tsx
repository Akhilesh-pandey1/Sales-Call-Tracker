import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/shared/utils/cn";

type PasswordInputProps = Omit<InputProps, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((currentValue) => !currentValue);
  };

  const inputClassName = cn(className, "pr-10");
  const toggleAriaLabel = isPasswordVisible ? "Hide password" : "Show password";

  return (
    <div className="relative w-full">
      <Input
        type={isPasswordVisible ? "text" : "password"}
        className={inputClassName}
        {...props}
      />
      <button
        type="button"
        aria-label={toggleAriaLabel}
        onClick={handleTogglePasswordVisibility}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {isPasswordVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
