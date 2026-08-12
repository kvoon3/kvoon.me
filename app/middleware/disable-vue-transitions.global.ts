export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !to.path.startsWith('/things') || !document.startViewTransition)
    return

  to.meta.pageTransition = false
  to.meta.layoutTransition = false
})
