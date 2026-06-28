export default defineNuxtRouteMiddleware(async (to) => {
  const tokenCookie = useCookie("auth_session");

  const pathLower = to.path.toLowerCase();
  if (
    pathLower === "/login" ||
    pathLower.startsWith("/auth") ||
    pathLower.startsWith("/(auth)")
  ) {
    if (tokenCookie.value) {
      return navigateTo("/");
    }
    return;
  }

  const { setToken } = useApi();
  const { checkAuth } = useAuth();

  if (!tokenCookie.value) {
    return navigateTo("/login");
  }

  setToken(tokenCookie.value);
  console.log("🔄 JWT synced from cookie:", tokenCookie.value);

  const authenticated = await checkAuth();
  if (!authenticated) {
    tokenCookie.value = null;
    return navigateTo("/login");
  }
});
