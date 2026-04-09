import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from './auth.api';
import { AuthContext, type AuthContextValue } from './auth-context';

const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const;

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  const { data: authPayload, isLoading: isInitializing } = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (payload) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, payload);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (payload) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, payload);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: authPayload?.user ?? null,
      isAuthenticated: Boolean(authPayload?.user),
      isInitializing,
      isSubmitting:
        loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending,
      login: async (input) => {
        await loginMutation.mutateAsync(input);
      },
      register: async (input) => {
        await registerMutation.mutateAsync(input);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [
      authPayload,
      isInitializing,
      loginMutation,
      logoutMutation,
      registerMutation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
