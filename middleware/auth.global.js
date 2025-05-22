export default defineNuxtRouteMiddleware(async (to) => {
  const { status } = await useAuth();
  const publicPages = ['/login'];

  if (status.value !== 'loading') {
    if (status.value === 'unauthenticated' && !publicPages.includes(to.path)) {
      return navigateTo('/login');
    }
  }
});
