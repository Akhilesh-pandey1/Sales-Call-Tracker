import { useState, type ChangeEvent, type FormEvent } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/shared/components/password-input";
import { useAuthLogin } from "../hooks/use-auth";

export function LoginPage() {
  const { login, isPending, errorMessage } = useAuthLogin();
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    login({ name, password });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6">
      <div className="my-auto py-12">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Phone className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Apex Sales Call</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manager Portal</p>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="mt-8 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div>
            <label htmlFor="login-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="login-name"
              name="name"
              type="text"
              autoComplete="username"
              placeholder="e.g. Rahul Verma"
              value={name}
              onChange={handleNameChange}
              className="mt-1.5 h-auto rounded-xl px-4 py-3 text-base"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-1.5 h-auto rounded-xl px-4 py-3 text-base"
            />
          </div>
          {errorMessage && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="mt-6 h-auto w-full rounded-xl py-3.5 text-base font-bold"
          >
            {isPending ? "Logging in..." : "Login to Dashboard"}
          </Button>
        </form>

        <div className="mt-6 rounded-xl border bg-card p-3 text-center text-xs text-muted-foreground">
          Web access is restricted to managers. Salespeople use the Android app.
        </div>
      </div>
    </div>
  );
}
