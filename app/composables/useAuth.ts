import { useApi } from "./useApi";

export function useAuth() {
  const { get, post, getToken } = useApi();
  const user = useState<any>("auth-user", () => null);
  const isLoggedIn = useState<boolean>("auth-logged-in", () => false);

  async function checkAuth() {
    const token = getToken();
    if (!token) {
      user.value = null;
      isLoggedIn.value = false;
      return false;
    }
    try {
      // Tentukan bahwa API verify mengembalikan objek user
      const res = await get<{ user: any }>("/auth/verify");
      user.value = res.user || res;
      isLoggedIn.value = true;
      return true;
    } catch {
      user.value = null;
      isLoggedIn.value = false;
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      return false;
    }
  }

  async function login(
    username: string,
    password: string,
    remember: boolean = false,
    captchaToken: string = "",
  ) {
    // Tentukan tipe datanya di dalam <...> setelah post
    const res = await post<{ token: string; user: any }>("/auth/login", {
      username,
      password,
      "g-recaptcha-response": captchaToken,
    });

    // Sekarang res.token dan res.user TIDAK AKAN MERAH LAGI!
    if (remember) {
      localStorage.setItem("token", res.token);
    } else {
      sessionStorage.setItem("token", res.token);
    }

    user.value = res.user;
    isLoggedIn.value = true;
    return res;
  }

  async function logout() {
    try {
      await post("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    user.value = null;
    isLoggedIn.value = false;
  }

  return {
    user,
    isLoggedIn,
    checkAuth,
    login,
    logout,
    getToken,
  };
}
