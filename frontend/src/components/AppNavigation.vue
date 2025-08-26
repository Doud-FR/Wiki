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

        <v-list-item @click="toggleTheme" prepend-icon="mdi-theme-light-dark">
          <v-list-item-title>{{ isDark ? 'Mode clair' : 'Mode sombre' }}</v-list-item-title>
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
        <!-- Main navigation -->
        <v-list-item prepend-icon="mdi-home" title="Accueil" @click="navigateToPage('/')"></v-list-item>
        <v-list-item prepend-icon="mdi-file-document-multiple" title="Documents" @click="navigateToPage('/documents')"></v-list-item>

        <!-- Creation options -->
        <v-divider class="my-2"></v-divider>
        <v-list-subheader>CRÉATION</v-list-subheader>
        
        <v-list-item prepend-icon="mdi-plus" title="Nouveau document" @click="createNewDocument"></v-list-item>
        <v-list-item prepend-icon="mdi-folder-plus" title="Nouveau dossier" @click="showCreateFolderDialog = true"></v-list-item>

        <!-- Admin section -->
        <template v-if="authStore.isAdmin">
          <v-divider class="my-2"></v-divider>
          <v-list-subheader>ADMINISTRATION</v-list-subheader>
          
          <v-list-item prepend-icon="mdi-account-group" title="Utilisateurs" @click="navigateToPage('/admin')"></v-list-item>
          <v-list-item prepend-icon="mdi-account-multiple" title="Groupes" @click="navigateToPage('/admin?tab=groups')"></v-list-item>
          <v-list-item prepend-icon="mdi-account-plus" title="Créer un utilisateur" @click="navigateToPage('/admin/register')"></v-list-item>
        </template>

        <!-- Folders -->
        <template v-if="recentFolders.length > 0">
          <v-divider class="my-2"></v-divider>
          <v-list-subheader>DOSSIERS</v-list-subheader>
          
          <v-list-item
            v-for="folder in recentFolders"
            :key="folder.id"
            :prepend-icon="'mdi-folder'"
            :title="folder.name"
            @click="navigateToFolder(folder)"
          ></v-list-item>
        </template>
      </v-list>

      <!-- Create folder dialog -->
      <v-dialog v-model="showCreateFolderDialog" max-width="400">
        <v-card>
          <v-card-title>Créer un nouveau dossier</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newFolderName"
              label="Nom du dossier"
              variant="outlined"
              @keyup.enter="createFolder"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showCreateFolderDialog = false">Annuler</v-btn>
            <v-btn color="primary" @click="createFolder">Créer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import { useTheme } from 'vuetify'

export default {
  name: 'AppNavigation',
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    const theme = useTheme()

    const drawer = ref(false)
    const searchQuery = ref('')
    const showCreateFolderDialog = ref(false)
    const newFolderName = ref('')
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

    const isDark = computed(() => theme.global.name.value === 'dark')

    const toggleTheme = () => {
      theme.global.name.value = theme.global.name.value === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', theme.global.name.value)
    }

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'Documents',
          query: { search: searchQuery.value.trim() }
        })
        drawer.value = false
      }
    }

    const navigateToPage = (path) => {
      router.push(path)
      drawer.value = false
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

    const createFolder = () => {
      if (newFolderName.value.trim()) {
        // Here we would call an API to create the folder
        toast.success(`Dossier "${newFolderName.value}" créé avec succès`)
        
        // Add to recent folders for demo
        recentFolders.value.push({
          id: Date.now(),
          name: newFolderName.value,
          path: `/folder/${Date.now()}`
        })
        
        newFolderName.value = ''
        showCreateFolderDialog.value = false
      }
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
      showCreateFolderDialog,
      newFolderName,
      recentFolders,
      userInitials,
      isDark,
      authStore,
      performSearch,
      navigateToPage,
      navigateToFolder,
      createNewDocument,
      createFolder,
      toggleTheme,
      logout
    }
  }
}
</script>
