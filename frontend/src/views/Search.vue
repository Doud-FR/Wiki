<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">mdi-file-search</v-icon>
          <div>
            <h1 class="text-h4">Recherche avancée</h1>
            <p class="text-subtitle-1 text-grey mb-0">Trouvez rapidement vos documents et dossiers</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Search form -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-6">
          <v-form @submit.prevent="performSearch">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchQuery"
                  label="Rechercher..."
                  placeholder="Tapez votre recherche ici"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  clearable
                  @keyup.enter="performSearch"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  prepend-icon="mdi-magnify"
                >
                  Rechercher
                </v-btn>
              </v-col>
            </v-row>

            <!-- Advanced filters -->
            <v-expansion-panels v-model="showAdvanced" class="mt-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Filtres avancés
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="filters.type"
                        :items="typeOptions"
                        label="Type de contenu"
                        variant="outlined"
                        clearable
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="filters.author"
                        :items="authorOptions"
                        label="Auteur"
                        variant="outlined"
                        clearable
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="filters.dateRange"
                        :items="dateRangeOptions"
                        label="Période"
                        variant="outlined"
                        clearable
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="filters.tags"
                        label="Tags (séparés par des virgules)"
                        variant="outlined"
                        clearable
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="filters.folder"
                        :items="folderOptions"
                        label="Dossier"
                        variant="outlined"
                        clearable
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search results -->
    <v-row v-if="hasSearched">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>
              Résultats de recherche
              <v-chip class="ml-2" size="small">{{ filteredResults.length }}</v-chip>
            </span>
            <v-btn-toggle v-model="resultViewMode" mandatory density="compact">
              <v-btn value="list" icon="mdi-view-list" size="small"></v-btn>
              <v-btn value="card" icon="mdi-view-grid" size="small"></v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <template v-if="filteredResults.length > 0">
              <!-- List view -->
              <template v-if="resultViewMode === 'list'">
                <v-list>
                  <v-list-item
                    v-for="result in filteredResults"
                    :key="result.id"
                    @click="openResult(result)"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :color="result.type === 'folder' ? 'blue' : 'green'"
                        class="mr-3"
                      >
                        {{ result.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}
                      </v-icon>
                    </template>

                    <v-list-item-title>{{ result.title }}</v-list-item-title>
                    <v-list-item-subtitle class="mt-1">
                      <div>{{ result.description || result.excerpt }}</div>
                      <div class="text-caption mt-1">
                        <v-chip size="x-small" :color="result.type === 'folder' ? 'blue' : 'green'">
                          {{ result.type === 'folder' ? 'Dossier' : 'Document' }}
                        </v-chip>
                        <span class="ml-2 text-grey">
                          Modifié le {{ formatDate(result.updatedAt) }}
                        </span>
                        <span v-if="result.author" class="ml-2 text-grey">
                          par {{ result.author }}
                        </span>
                      </div>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-btn
                        icon="mdi-open-in-new"
                        variant="text"
                        size="small"
                        @click.stop="openResult(result)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </template>

              <!-- Card view -->
              <template v-else>
                <v-row>
                  <v-col
                    v-for="result in filteredResults"
                    :key="result.id"
                    cols="12"
                    md="6"
                    lg="4"
                  >
                    <v-card
                      class="result-card"
                      @click="openResult(result)"
                    >
                      <v-card-text>
                        <div class="d-flex align-center mb-2">
                          <v-icon
                            :color="result.type === 'folder' ? 'blue' : 'green'"
                            class="mr-2"
                          >
                            {{ result.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}
                          </v-icon>
                          <div class="text-h6 text-truncate">{{ result.title }}</div>
                        </div>
                        <div class="text-body-2 text-grey mb-2">
                          {{ result.description || result.excerpt }}
                        </div>
                        <div class="d-flex justify-space-between align-center">
                          <v-chip
                            size="small"
                            :color="result.type === 'folder' ? 'blue' : 'green'"
                          >
                            {{ result.type === 'folder' ? 'Dossier' : 'Document' }}
                          </v-chip>
                          <div class="text-caption text-grey">
                            {{ formatDate(result.updatedAt) }}
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </template>

            <template v-else>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-magnify</v-icon>
                <div class="text-h6 text-grey">Aucun résultat trouvé</div>
                <div class="text-body-2 text-grey">
                  Essayez de modifier vos critères de recherche
                </div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search suggestions -->
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title>Suggestions de recherche</v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                @click="searchQuery = suggestion; performSearch()"
              >
                {{ suggestion }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Search',
  setup () {
    const router = useRouter()
    const toast = useToast()

    const searchQuery = ref('')
    const hasSearched = ref(false)
    const showAdvanced = ref([])
    const resultViewMode = ref('list')

    const filters = ref({
      type: null,
      author: null,
      dateRange: null,
      tags: '',
      folder: null
    })

    // Mock search results
    const searchResults = ref([])

    const mockResults = [
      {
        id: 1,
        title: 'Guide de démarrage',
        type: 'document',
        description: 'Guide pour commencer avec Wiki App',
        excerpt: 'Ce guide vous aidera à démarrer rapidement avec la plateforme...',
        author: 'Admin User',
        updatedAt: '2024-01-15T10:30:00Z',
        tags: ['guide', 'démarrage']
      },
      {
        id: 2,
        title: 'Documentation technique',
        type: 'folder',
        description: 'Dossier contenant toute la documentation technique',
        author: 'Admin User',
        updatedAt: '2024-01-14T15:20:00Z',
        tags: ['documentation', 'technique']
      },
      {
        id: 3,
        title: 'Procédures administratives',
        type: 'document',
        description: 'Document des procédures administratives',
        excerpt: 'Les procédures à suivre pour les tâches administratives...',
        author: 'John Doe',
        updatedAt: '2024-01-13T09:15:00Z',
        tags: ['procédures', 'admin']
      }
    ]

    const typeOptions = [
      { title: 'Document', value: 'document' },
      { title: 'Dossier', value: 'folder' }
    ]

    const authorOptions = [
      { title: 'Admin User', value: 'Admin User' },
      { title: 'John Doe', value: 'John Doe' },
      { title: 'Jane Smith', value: 'Jane Smith' }
    ]

    const dateRangeOptions = [
      { title: 'Dernière semaine', value: 'week' },
      { title: 'Dernier mois', value: 'month' },
      { title: 'Dernière année', value: 'year' }
    ]

    const folderOptions = [
      { title: 'Documentation', value: 'documentation' },
      { title: 'Projets', value: 'projets' },
      { title: 'Guides', value: 'guides' }
    ]

    const searchSuggestions = [
      'guide démarrage',
      'documentation',
      'procédures',
      'administration',
      'projets'
    ]

    const filteredResults = computed(() => {
      let results = searchResults.value

      if (filters.value.type) {
        results = results.filter(r => r.type === filters.value.type)
      }

      if (filters.value.author) {
        results = results.filter(r => r.author === filters.value.author)
      }

      if (filters.value.tags) {
        const filterTags = filters.value.tags.toLowerCase().split(',').map(t => t.trim())
        results = results.filter(r =>
          r.tags && r.tags.some(tag =>
            filterTags.some(filterTag => tag.toLowerCase().includes(filterTag))
          )
        )
      }

      return results
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const performSearch = () => {
      if (!searchQuery.value.trim()) {
        toast.warning('Veuillez saisir un terme de recherche')
        return
      }

      hasSearched.value = true

      // Simulate search - in real app this would call an API
      const query = searchQuery.value.toLowerCase()
      searchResults.value = mockResults.filter(result =>
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        (result.excerpt && result.excerpt.toLowerCase().includes(query)) ||
        (result.tags && result.tags.some(tag => tag.toLowerCase().includes(query)))
      )

      toast.success(`${searchResults.value.length} résultat(s) trouvé(s)`)
    }

    const openResult = (result) => {
      if (result.type === 'folder') {
        router.push(`/explorer?folder=${result.id}`)
      } else {
        router.push(`/document/${result.id}`)
      }
    }

    return {
      searchQuery,
      hasSearched,
      showAdvanced,
      resultViewMode,
      filters,
      searchResults,
      filteredResults,
      typeOptions,
      authorOptions,
      dateRangeOptions,
      folderOptions,
      searchSuggestions,
      formatDate,
      performSearch,
      openResult
    }
  }
}
</script>

<style scoped>
.result-card {
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}
</style>
