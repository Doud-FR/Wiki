<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">mdi-folder-open</v-icon>
          <div>
            <h1 class="text-h4">Explorateur de fichiers</h1>
            <p class="text-subtitle-1 text-grey mb-0">Naviguez dans vos dossiers et fichiers</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Breadcrumb -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbItems" class="pa-0">
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :disabled="item.disabled"
              @click="navigateToFolder(item.folderId)"
            >
              {{ item.title }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
      </v-col>
    </v-row>

    <!-- Toolbar -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-file-document-plus"
                @click="createNewDocument"
              >
                Nouveau document
              </v-btn>
              <v-btn
                color="secondary"
                prepend-icon="mdi-folder-plus"
                @click="showCreateFolderDialog = true"
              >
                Nouveau dossier
              </v-btn>
              <v-btn
                v-if="authStore.isAdmin"
                variant="outlined"
                prepend-icon="mdi-upload"
                @click="showUploadDialog = true"
              >
                Importer
              </v-btn>
            </div>

            <div class="d-flex gap-2">
              <v-text-field
                v-model="searchQuery"
                placeholder="Rechercher..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                style="max-width: 300px;"
                @keyup.enter="searchItems"
              ></v-text-field>

              <v-btn-toggle v-model="viewMode" mandatory>
                <v-btn value="list" icon="mdi-view-list"></v-btn>
                <v-btn value="grid" icon="mdi-view-grid"></v-btn>
              </v-btn-toggle>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- File/Folder Grid -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <template v-if="viewMode === 'grid'">
              <v-row>
                <v-col
                  v-for="item in filteredItems"
                  :key="item.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="file-item"
                    :color="item.type === 'folder' ? 'blue-grey-lighten-5' : 'grey-lighten-4'"
                    @click="item.type === 'folder' ? openFolder(item) : openDocument(item)"
                    @contextmenu.prevent="showContextMenu($event, item)"
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon
                        :color="item.type === 'folder' ? 'blue' : 'green'"
                        size="48"
                        class="mb-2"
                      >
                        {{ item.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}
                      </v-icon>
                      <div class="text-subtitle-2 text-truncate">{{ item.name }}</div>
                      <div class="text-caption text-grey">
                        {{ item.type === 'folder' ? `${item.itemCount || 0} éléments` : formatDate(item.updatedAt) }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-data-table
                :headers="headers"
                :items="filteredItems"
                @click:row="(event, { item }) => item.type === 'folder' ? openFolder(item) : openDocument(item)"
              >
                <template v-slot:item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      :color="item.type === 'folder' ? 'blue' : 'green'"
                      class="mr-2"
                    >
                      {{ item.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}
                    </v-icon>
                    {{ item.name }}
                  </div>
                </template>

                <template v-slot:item.type="{ item }">
                  <v-chip
                    :color="item.type === 'folder' ? 'blue' : 'green'"
                    size="small"
                  >
                    {{ item.type === 'folder' ? 'Dossier' : 'Document' }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    @click.stop="showContextMenu($event, item)"
                  ></v-btn>
                </template>
              </v-data-table>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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

    <!-- Upload dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500">
      <v-card>
        <v-card-title>Importer des fichiers</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="selectedFiles"
            label="Sélectionner des fichiers"
            multiple
            variant="outlined"
            prepend-icon="mdi-upload"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showUploadDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="handleUpload">Importer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Context menu -->
    <v-menu
      v-model="contextMenu.show"
      :position-x="contextMenu.x"
      :position-y="contextMenu.y"
      absolute
      offset-y
    >
      <v-list v-if="contextMenu.item">
        <v-list-item @click="openItem(contextMenu.item)">
          <v-list-item-title>Ouvrir</v-list-item-title>
        </v-list-item>
        <v-list-item @click="renameItem(contextMenu.item)">
          <v-list-item-title>Renommer</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="authStore.isAdmin" @click="managePermissions(contextMenu.item)">
          <v-list-item-title>Permissions</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="deleteItem(contextMenu.item)" class="text-red">
          <v-list-item-title>Supprimer</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Explorer',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const toast = useToast()

    const searchQuery = ref('')
    const viewMode = ref('grid')
    const showCreateFolderDialog = ref(false)
    const showUploadDialog = ref(false)
    const newFolderName = ref('')
    const selectedFiles = ref([])
    const currentFolderId = ref(null)
    const currentPath = ref([])

    const contextMenu = ref({
      show: false,
      x: 0,
      y: 0,
      item: null
    })

    // Mock data - in real app this would come from API
    const items = ref([
      {
        id: 1,
        name: 'Documentation',
        type: 'folder',
        folderId: null,
        itemCount: 12,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Projets',
        type: 'folder',
        folderId: null,
        itemCount: 8,
        createdAt: '2024-01-14T15:20:00Z',
        updatedAt: '2024-01-14T15:20:00Z'
      },
      {
        id: 3,
        name: 'Guide de démarrage',
        type: 'document',
        folderId: null,
        description: 'Guide pour commencer avec Wiki App',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 4,
        name: 'Procédures',
        type: 'document',
        folderId: null,
        description: 'Document des procédures',
        createdAt: '2024-01-14T15:20:00Z',
        updatedAt: '2024-01-14T15:20:00Z'
      }
    ])

    const headers = [
      { title: 'Nom', key: 'name', align: 'start' },
      { title: 'Type', key: 'type', align: 'center' },
      { title: 'Modifié le', key: 'updatedAt' },
      { title: 'Actions', key: 'actions', align: 'center', sortable: false }
    ]

    const breadcrumbItems = computed(() => {
      const items = [{ title: 'Accueil', folderId: null, disabled: false }]

      currentPath.value.forEach(folder => {
        items.push({
          title: folder.name,
          folderId: folder.id,
          disabled: false
        })
      })

      if (items.length > 1) {
        items[items.length - 1].disabled = true
      }

      return items
    })

    const filteredItems = computed(() => {
      let filtered = items.value.filter(item =>
        item.folderId === currentFolderId.value
      )

      if (searchQuery.value) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      return filtered
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const navigateToFolder = (folderId) => {
      currentFolderId.value = folderId

      if (folderId === null) {
        currentPath.value = []
      } else {
        // Build path by finding parent folders
        const buildPath = (id, path = []) => {
          const folder = items.value.find(d => d.id === id && d.type === 'folder')
          if (folder) {
            path.unshift(folder)
            if (folder.folderId !== null) {
              buildPath(folder.folderId, path)
            }
          }
          return path
        }
        currentPath.value = buildPath(folderId)
      }
    }

    const openFolder = (folder) => {
      navigateToFolder(folder.id)
    }

    const openDocument = (document) => {
      router.push(`/document/${document.id}`)
    }

    const openItem = (item) => {
      if (item.type === 'folder') {
        openFolder(item)
      } else {
        openDocument(item)
      }
    }

    const createNewDocument = () => {
      router.push('/documents/new')
    }

    const createFolder = () => {
      if (newFolderName.value.trim()) {
        const newFolder = {
          id: Date.now(),
          name: newFolderName.value,
          type: 'folder',
          folderId: currentFolderId.value,
          itemCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        items.value.push(newFolder)
        toast.success(`Dossier "${newFolderName.value}" créé avec succès`)

        newFolderName.value = ''
        showCreateFolderDialog.value = false
      }
    }

    const searchItems = () => {
      // Search functionality handled by computed property
    }

    const showContextMenu = (event, item) => {
      event.preventDefault()
      contextMenu.value.show = false
      contextMenu.value.x = event.clientX
      contextMenu.value.y = event.clientY
      contextMenu.value.item = item
      setTimeout(() => {
        contextMenu.value.show = true
      })
    }

    const renameItem = (item) => {
      const newName = prompt(`Nouveau nom pour "${item.name}":`, item.name)
      if (newName && newName !== item.name) {
        item.name = newName
        toast.success('Élément renommé avec succès')
      }
      contextMenu.value.show = false
    }

    const deleteItem = (item) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
        const index = items.value.findIndex(i => i.id === item.id)
        if (index > -1) {
          items.value.splice(index, 1)
          toast.success('Élément supprimé avec succès')
        }
      }
      contextMenu.value.show = false
    }

    const managePermissions = (item) => {
      toast.info('Gestion des permissions en cours de développement')
      contextMenu.value.show = false
    }

    const handleUpload = () => {
      toast.info('Fonctionnalité d\'import en cours de développement')
      showUploadDialog.value = false
    }

    onMounted(() => {
      // Check if we need to navigate to a specific folder from route params
      if (route.query.folder) {
        navigateToFolder(parseInt(route.query.folder))
      }
    })

    return {
      authStore,
      searchQuery,
      viewMode,
      showCreateFolderDialog,
      showUploadDialog,
      newFolderName,
      selectedFiles,
      items,
      headers,
      breadcrumbItems,
      filteredItems,
      contextMenu,
      formatDate,
      navigateToFolder,
      openFolder,
      openDocument,
      openItem,
      createNewDocument,
      createFolder,
      searchItems,
      showContextMenu,
      renameItem,
      deleteItem,
      managePermissions,
      handleUpload
    }
  }
}
</script>

<style scoped>
.file-item {
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}
</style>
