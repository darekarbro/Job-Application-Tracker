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
import type { AuthUser } from './auth.types';

const AUTH_USER_QUERY_KEY = ['auth', 'user'] as const;
const IS_AUTH_BYPASS_ENABLED = import.meta.env.VITE_BYPASS_AUTH === 'true';
const AUTH_BYPASS_USER: AuthUser = {
  id: 'dev-bypass-user',
  email: 'dev-bypass@local.dev',
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();

  const { data: authPayload, isLoading: isInitializing } = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: !IS_AUTH_BYPASS_ENABLED,
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
      user: IS_AUTH_BYPASS_ENABLED ? AUTH_BYPASS_USER : (authPayload?.user ?? null),
      isAuthenticated: IS_AUTH_BYPASS_ENABLED || Boolean(authPayload?.user),
      isInitializing: IS_AUTH_BYPASS_ENABLED ? false : isInitializing,
      isSubmitting: IS_AUTH_BYPASS_ENABLED
        ? false
        : loginMutation.isPending ||
          registerMutation.isPending ||
          logoutMutation.isPending,
      login: async (input) => {
        if (IS_AUTH_BYPASS_ENABLED) {
          return;
        }

        await loginMutation.mutateAsync(input);
      },
      register: async (input) => {
        if (IS_AUTH_BYPASS_ENABLED) {
          return;
        }

        await registerMutation.mutateAsync(input);
      },
      logout: async () => {
        if (IS_AUTH_BYPASS_ENABLED) {
          return;
        }

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
