export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[auth middleware] checking auth status...');

  const { status } = await useAuth();
  const publicPages = ['/login'];

  console.log('[auth middleware] Auth status:', status.value);
  console.log('[auth middleware] Target path:', to.path);

  if (status.value !== 'loading') {
    if (status.value === 'unauthenticated' && !publicPages.includes(to.path)) {
      console.log(
        '[auth middleware] User unauthenticated, redirecting to login'
      );
      return navigateTo('/login');
    } else {
      console.log('[auth middleware] User authenticated or on a public page');
    }
  } else {
    console.log('[auth middleware] Auth status is still loading');
  }
});
