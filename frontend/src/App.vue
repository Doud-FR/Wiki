<template>
  <v-app>
    <AppNavigation v-if="showNavigation" />

    <v-main>
      <router-view />
    </v-main>

    <AppFooter v-if="showNavigation" />
  </v-app>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AppNavigation from '@/components/AppNavigation.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppNavigation,
    AppFooter
  },
  setup () {
    const route = useRoute()
    const authStore = useAuthStore()

    // Initialize auth state on app load
    authStore.initializeAuth()

    const showNavigation = computed(() => {
      const guestRoutes = ['Login', 'Register']
      return authStore.isAuthenticated && !guestRoutes.includes(route.name)
    })

    return {
      showNavigation
    }
  }
}
</script>

<style>
html {
  overflow-y: auto !important;
}

.v-application {
  font-family: 'Roboto', sans-serif !important;
}

/* Beautiful gradient background for all pages */
.v-main {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* Dark theme gradient */
.v-theme--dark .v-main {
  background: linear-gradient(135deg, #0f0f23 0%, #1e1b4b 50%, #312e81 100%);
}

/* Ensure cursor pointer for clickable elements */
.cursor-pointer {
  cursor: pointer;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark theme scrollbar */
.v-theme--dark ::-webkit-scrollbar-track {
  background: #1e1b4b;
}

.v-theme--dark ::-webkit-scrollbar-thumb {
  background: #6366f1;
}

.v-theme--dark ::-webkit-scrollbar-thumb:hover {
  background: #7c3aed;
}

/* Markdown content styling */
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-content p {
  margin-bottom: 1em;
}

.markdown-content code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.v-theme--dark .markdown-content code {
  background-color: #312e81;
  color: #e2e8f0;
}

.markdown-content pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1em 0;
}

.v-theme--dark .markdown-content pre {
  background-color: #312e81;
  color: #e2e8f0;
}

.markdown-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
}

.v-theme--dark .markdown-content blockquote {
  border-left-color: #6366f1;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #ddd;
  padding: 0.5em;
  text-align: left;
}

.v-theme--dark .markdown-content th,
.v-theme--dark .markdown-content td {
  border-color: #6366f1;
}

.markdown-content th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.v-theme--dark .markdown-content th {
  background-color: #312e81;
}
</style>
