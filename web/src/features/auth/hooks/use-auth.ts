import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserData } from "@/app/providers";
import { loginUser } from "../api/auth.api";
import type { LoginApiResponse, LoginCredentials } from "../types";

interface LoginApiErrorBody {
  message?: string;
}

interface UseAuthLoginResult {
  login: (credentials: LoginCredentials) => void;
  isPending: boolean;
  errorMessage: string | null;
}

function getLoginErrorMessage(error: unknown): string {
  const fallbackMessage: string = "Something went wrong. Please try again.";
  if (!isAxiosError(error)) {
    return fallbackMessage;
  }
  if (!error.response) {
    const serverUnreachableMessage: string = "Can't reach the server. Check your internet.";
    return serverUnreachableMessage;
  }
  const errorBody: LoginApiErrorBody | undefined = error.response
    .data as LoginApiErrorBody | undefined;
  const serverMessage: string | undefined = errorBody?.message;
  const resolvedMessage: string = serverMessage || fallbackMessage;
  return resolvedMessage;
}

export function useAuthLogin(): UseAuthLoginResult {
  const navigate = useNavigate();
  const { login: storeSession } = useAuth();

  const handleLoginSuccess = (response: LoginApiResponse): void => {
    const sessionUser: UserData = {
      id: response.id,
      name: response.name,
      role: response.role,
      country: response.country,
    };
    storeSession(response.token, sessionUser);
    navigate("/");
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: handleLoginSuccess,
  });

  const login = (credentials: LoginCredentials): void => {
    loginMutation.mutate(credentials);
  };

  const hasLoginFailed: boolean = loginMutation.isError;
  const errorMessage: string | null = hasLoginFailed
    ? getLoginErrorMessage(loginMutation.error)
    : null;

  const result: UseAuthLoginResult = {
    login,
    isPending: loginMutation.isPending,
    errorMessage,
  };
  return result;
}
