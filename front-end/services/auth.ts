// services/auth.ts
export const useAuthService = () => {
  const apiFetch = useNuxtApp().$apiFetch;

  const login = async (username: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: { username, password },
    });

    // simpan token di cookie
    const token = useCookie("token");
    token.value = res.access_token;

    return res;
  };

  const logout = () => {
    const token = useCookie("token");
    token.value = null;
  };

  return { login, logout };
};
