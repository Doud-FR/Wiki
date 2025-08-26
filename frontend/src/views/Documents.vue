<template>
  <v-container class="py-6">
    <v-card class="elevation-8" rounded="lg">
      <v-card-text class="pa-6">
        <!-- Header -->
        <v-row class="mb-4">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="32" color="primary">mdi-file-document-multiple</v-icon>
              <div>
                <h1 class="text-h4 text-primary">Documents</h1>
                <p class="text-subtitle-1 text-grey mb-0">Gérez vos documents et dossiers</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showCreateDialog = true"
              class="mr-2"
              elevation="2"
            >
              Nouveau document
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-folder-plus"
              @click="showCreateFolderDialog = true"
              elevation="2"
            >
              Nouveau dossier
            </v-btn>
          </v-col>
        </v-row>

    <!-- Breadcrumb -->
    <v-row v-if="currentPath.length > 0" class="mb-4">
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbItems">
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

    <!-- Search and Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          placeholder="Rechercher des documents..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          @input="searchDocuments"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Trier par"
          variant="outlined"
          density="compact"
          @update:modelValue="sortDocuments"
        ></v-select>
      </v-col>
    </v-row>

        <!-- Documents List -->
        <v-card class="elevation-2" rounded="lg">
          <v-card-text class="pa-0">
            <v-data-table
              :headers="headers"
              :items="filteredItems"
              :loading="loading"
              item-value="id"
              class="elevation-0"
            >
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey" class="mb-4">mdi-folder-open</v-icon>
                  <h3 class="text-h6 mb-2">Aucun document trouvé</h3>
                  <p class="text-grey mb-4">Commencez par créer votre premier document ou dossier</p>
                  <div class="d-flex justify-center gap-2">
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      @click="showCreateDialog = true"
                    >
                      Nouveau document
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      color="primary"
                      prepend-icon="mdi-folder-plus"
                      @click="showCreateFolderDialog = true"
                    >
                      Nouveau dossier
                    </v-btn>
                  </div>
                </div>
              </template>
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon class="mr-3" :color="item.type === 'folder' ? 'amber' : 'primary'">
                {{ item.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}
              </v-icon>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div v-if="item.description" class="text-caption text-grey">{{ item.description }}</div>
              </div>
            </div>
          </template>

          <template #item.type="{ item }">
            <v-chip
              :color="item.type === 'folder' ? 'amber' : 'primary'"
              variant="flat"
              size="small"
            >
              {{ item.type === 'folder' ? 'Dossier' : 'Document' }}
            </v-chip>
          </template>

          <template #item.updatedAt="{ item }">
            {{ formatDate(item.updatedAt) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.type === 'folder'"
              icon="mdi-folder-open"
              variant="text"
              size="small"
              @click="openFolder(item)"
            ></v-btn>
            <v-btn
              v-else
              icon="mdi-eye"
              variant="text"
              size="small"
              @click="openDocument(item)"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editItem(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteItem(item)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Create Document Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Créer un nouveau document</v-card-title>
        <v-card-text>
          <v-form ref="createForm">
            <v-text-field
              v-model="newDocument.name"
              label="Nom du document"
              variant="outlined"
              :rules="nameRules"
              class="mb-3"
            ></v-text-field>
            <v-textarea
              v-model="newDocument.description"
              label="Description (optionnelle)"
              variant="outlined"
              rows="3"
            ></v-textarea>
            <v-select
              v-model="newDocument.type"
              :items="documentTypes"
              label="Type de document"
              variant="outlined"
              class="mb-3"
            ></v-select>
            <v-select
              v-model="newDocument.groups"
              :items="availableGroups"
              label="Assigner aux groupes (optionnel)"
              variant="outlined"
              multiple
              chips
              closable-chips
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCreateDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="createDocument">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Create Folder Dialog -->
    <v-dialog v-model="showCreateFolderDialog" max-width="400">
      <v-card>
        <v-card-title>Créer un nouveau dossier</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newFolderName"
            label="Nom du dossier"
            variant="outlined"
            :rules="nameRules"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCreateFolderDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="createFolder">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { documentsAPI, foldersAPI, groupsAPI } from '@/services/api'

export default {
  name: 'Documents',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const loading = ref(false)
    const searchQuery = ref('')
    const sortBy = ref('updatedAt')
    const showCreateDialog = ref(false)
    const showCreateFolderDialog = ref(false)
    const newFolderName = ref('')
    const createForm = ref(null)
    const currentFolderId = ref(null)
    const currentPath = ref([])

    const newDocument = reactive({
      name: '',
      description: '',
      type: 'markdown',
      groups: []
    })

    // Load available groups for assignment
    const availableGroups = ref([])
    const loadGroups = async () => {
      try {
        const response = await groupsAPI.getAll()
        availableGroups.value = response.data?.map(group => ({
          title: group.name,
          value: group.id
        })) || []
      } catch (error) {
        console.error('Error loading groups:', error)
      }
    }

    // Documents data
    const documents = ref([])

    // Load documents from API
    const loadDocuments = async () => {
      try {
        loading.value = true
        const params = {}
        if (currentFolderId.value !== null) {
          params.folderId = currentFolderId.value
        }

        const response = await documentsAPI.getAll(params)
        documents.value = response.data || []
      } catch (error) {
        console.error('Error loading documents:', error)
        toast.error('Erreur lors du chargement des documents')
      } finally {
        loading.value = false
      }
    }

    const headers = [
      { title: 'Nom', key: 'name', sortable: true },
      { title: 'Type', key: 'type', sortable: true },
      { title: 'Modifié le', key: 'updatedAt', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
    ]

    const sortOptions = [
      { title: 'Date de modification', value: 'updatedAt' },
      { title: 'Nom', value: 'name' },
      { title: 'Type', value: 'type' }
    ]

    const documentTypes = [
      { title: 'Markdown', value: 'markdown' },
      { title: 'Document Word', value: 'docx' }
    ]

    const nameRules = [
      v => !!v || 'Le nom est requis',
      v => (v && v.length >= 2) || 'Le nom doit contenir au moins 2 caractères'
    ]

    const filteredItems = computed(() => {
      if (!documents.value || !Array.isArray(documents.value)) {
        return []
      }

      let items = documents.value.filter(doc => doc && doc.folderId === currentFolderId.value)

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        items = items.filter(item =>
          (item && item.name && item.name.toLowerCase().includes(query)) ||
          (item && item.description && item.description.toLowerCase().includes(query))
        )
      }

      return items.sort((a, b) => {
        if (!a || !b) return 0
        if (sortBy.value === 'name') {
          return (a.name || '').localeCompare(b.name || '')
        } else if (sortBy.value === 'type') {
          return (a.type || '').localeCompare(b.type || '')
        } else {
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
        }
      })
    })

    const breadcrumbItems = computed(() => {
      const items = [{ title: 'Accueil', folderId: null, disabled: false }]

      if (currentPath.value && Array.isArray(currentPath.value)) {
        currentPath.value.forEach((folder, index) => {
          if (folder && folder.name) {
            items.push({
              title: folder.name,
              folderId: folder.id,
              disabled: index === currentPath.value.length - 1
            })
          }
        })
      }

      return items
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

    const navigateToFolder = async (folderId) => {
      currentFolderId.value = folderId
      await loadDocuments()

      if (folderId === null) {
        currentPath.value = []
      } else {
        // Build path by finding parent folders
        const buildPath = (id, path = []) => {
          const folder = documents.value.find(d => d.id === id && d.type === 'folder')
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

    const editItem = (item) => {
      if (item.type === 'document') {
        router.push(`/document/${item.id}/edit`)
      } else {
        toast.info('Édition des dossiers en cours de développement')
      }
    }

    const deleteItem = async (item) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
        try {
          if (item.type === 'document') {
            await documentsAPI.delete(item.id)
          } else {
            await foldersAPI.delete(item.id)
          }

          // Reload documents after deletion
          await loadDocuments()
          toast.success(`${item.type === 'folder' ? 'Dossier' : 'Document'} supprimé avec succès`)
        } catch (error) {
          console.error('Error deleting item:', error)
          toast.error('Erreur lors de la suppression')
        }
      }
    }

    const createDocument = async () => {
      const { valid } = await createForm.value.validate()
      if (!valid) return

      try {
        loading.value = true
        const documentData = {
          name: newDocument.name,
          description: newDocument.description,
          type: newDocument.type,
          folderId: currentFolderId.value
        }

        const response = await documentsAPI.create(documentData)
        const newDoc = response.data

        toast.success('Document créé avec succès')

        // Reset form
        newDocument.name = ''
        newDocument.description = ''
        newDocument.type = 'markdown'
        newDocument.groups = []
        showCreateDialog.value = false

        // Reload documents to show the new one
        await loadDocuments()

        // Navigate to edit the document
        router.push(`/document/${newDoc.id}/edit`)
      } catch (error) {
        console.error('Error creating document:', error)
        toast.error('Erreur lors de la création du document')
      } finally {
        loading.value = false
      }
    }

    const createFolder = async () => {
      if (newFolderName.value.trim()) {
        try {
          loading.value = true
          const folderData = {
            name: newFolderName.value,
            description: '',
            parentId: currentFolderId.value
          }

          await foldersAPI.create(folderData)
          toast.success('Dossier créé avec succès')

          newFolderName.value = ''
          showCreateFolderDialog.value = false

          // Reload documents to show the new folder
          await loadDocuments()
        } catch (error) {
          console.error('Error creating folder:', error)
          toast.error('Erreur lors de la création du dossier')
        } finally {
          loading.value = false
        }
      }
    }

    const searchDocuments = () => {
      // Search is reactive through computed property
    }

    const sortDocuments = () => {
      // Sorting is reactive through computed property
    }

    onMounted(async () => {
      // Load initial data
      await Promise.all([loadDocuments(), loadGroups()])

      // Check if we need to navigate to a specific folder from route params
      if (route.query.folder) {
        await navigateToFolder(parseInt(route.query.folder))
      }
    })

    return {
      loading,
      searchQuery,
      sortBy,
      showCreateDialog,
      showCreateFolderDialog,
      newFolderName,
      createForm,
      newDocument,
      documents,
      headers,
      sortOptions,
      documentTypes,
      nameRules,
      filteredItems,
      breadcrumbItems,
      currentPath,
      formatDate,
      navigateToFolder,
      openFolder,
      openDocument,
      editItem,
      deleteItem,
      createDocument,
      createFolder,
      searchDocuments,
      sortDocuments,
      loadDocuments,
      availableGroups,
      loadGroups
    }
  }
}
</script>
