<template>
  <v-app-bar color="primary" dark prominent>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
      Wiki App
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Search bar -->
    <v-text-field
      v-model="searchQuery"
      hide-details
      single-line
      placeholder="Rechercher..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      class="mr-4"
      style="max-width: 300px;"
      @keyup.enter="performSearch"
    ></v-text-field>

    <!-- User menu -->
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-avatar size="32">
            <span class="text-h6">{{ userInitials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item prepend-icon="mdi-account">
          <v-list-item-title>{{ authStore.fullName }}</v-list-item-title>
          <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
        </v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item @click="$router.push('/profile')" prepend-icon="mdi-account-edit">
          <v-list-item-title>Profil</v-list-item-title>
        </v-list-item>
        
        <v-list-item v-if="authStore.isAdmin" @click="$router.push('/admin')" prepend-icon="mdi-cog">
          <v-list-item-title>Administration</v-list-item-title>
        </v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item @click="logout" prepend-icon="mdi-logout">
          <v-list-item-title>Déconnexion</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home" title="Accueil" value="home" @click="$router.push('/')"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple" title="Documents" value="documents" @click="$router.push('/documents')"></v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-subheader>DOSSIERS</v-list-subheader>
        <!-- Folder tree will be loaded here -->
        <v-list-item
          v-for="folder in recentFolders"
          :key="folder.id"
          :prepend-icon="'mdi-folder'"
          :title="folder.name"
          @click="navigateToFolder(folder)"
        ></v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-item prepend-icon="mdi-plus" title="Nouveau document" @click="createNewDocument"></v-list-item>
        <v-list-item prepend-icon="mdi-folder-plus" title="Nouveau dossier" @click="createNewFolder"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'AppNavigation',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const drawer = ref(false)
    const searchQuery = ref('')
    const recentFolders = ref([
      { id: 1, name: 'Documentation', path: '/docs' },
      { id: 2, name: 'Projets', path: '/projects' },
      { id: 3, name: 'Guides', path: '/guides' }
    ])

    const userInitials = computed(() => {
      if (!authStore.user) return '?'
      const first = authStore.user.firstName?.[0] || ''
      const last = authStore.user.lastName?.[0] || ''
      return (first + last).toUpperCase()
    })

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'Documents',
          query: { search: searchQuery.value.trim() }
        })
        drawer.value = false
      }
    }

    const navigateToFolder = (folder) => {
      router.push({
        name: 'Documents',
        query: { folder: folder.id }
      })
      drawer.value = false
    }

    const createNewDocument = () => {
      router.push('/documents/new')
      drawer.value = false
    }

    const createNewFolder = () => {
      // This would open a dialog to create a new folder
      toast.info('Fonctionnalité en cours de développement')
      drawer.value = false
    }

    const logout = async () => {
      try {
        authStore.logout()
        toast.success('Déconnexion réussie')
        router.push('/login')
      } catch (error) {
        toast.error('Erreur lors de la déconnexion')
      }
    }

    return {
      drawer,
      searchQuery,
      recentFolders,
      userInitials,
      authStore,
      performSearch,
      navigateToFolder,
      createNewDocument,
      createNewFolder,
      logout
    }
  }
}
</script>