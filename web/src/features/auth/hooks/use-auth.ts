import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserData } from "@/app/providers";
import { getApiErrorMessage } from "@/shared/api/api-error-message";
import { loginUser } from "../api/auth.api";
import type { LoginApiResponse, LoginCredentials } from "../types";

interface UseAuthLoginResult {
  login: (credentials: LoginCredentials) => void;
  isPending: boolean;
  errorMessage: string | null;
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
    ? getApiErrorMessage(loginMutation.error)
    : null;

  const result: UseAuthLoginResult = {
    login,
    isPending: loginMutation.isPending,
    errorMessage,
  };
  return result;
}
