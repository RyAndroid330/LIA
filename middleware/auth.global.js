export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[auth middleware] checking auth status...');

  const { status } = await useAuth();
  const publicPages = ['/login'];

  console.log(status.value, to.path);
  if (status.value !== 'loading') {
    if (status.value === 'unauthenticated' && !publicPages.includes(to.path)) {
      console.log('[auth middleware] redirecting to login');
      return navigateTo('/login');
    }
  }
});
