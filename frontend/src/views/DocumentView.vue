<template>
  <v-container fluid class="pa-4">
    <!-- Document Header -->
    <v-card class="mb-4" elevation="2">
      <v-card-text class="py-3">
        <div class="d-flex align-center">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="goBack"
            class="mr-3"
          ></v-btn>

          <v-icon class="mr-3" color="primary" size="32">
            mdi-language-markdown
          </v-icon>

          <div class="flex-grow-1">
            <h1 class="text-h4 mb-1">{{ document.title }}</h1>
            <p class="text-body-2 text-grey mb-0">{{ document.description }}</p>
          </div>

          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              variant="outlined"
              color="primary"
              @click="editDocument"
            ></v-btn>

            <v-btn
              icon="mdi-share"
              variant="outlined"
              @click="shareDocument"
            ></v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Document Metadata -->
    <v-card class="mb-4" elevation="1">
      <v-card-text class="py-3">
        <v-row align="center">
          <v-col cols="auto">
            <div class="d-flex align-center">
              <v-avatar size="28" class="mr-2">
                <span class="text-caption">{{ getAuthorInitials(document.author) }}</span>
              </v-avatar>
              <div>
                <div class="text-body-2">{{ document.author }}</div>
                <div class="text-caption text-grey">{{ formatDate(document.updatedAt) }}</div>
              </div>
            </div>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-chip-group>
              <v-chip
                v-for="tag in document.tags"
                :key="tag"
                size="small"
                variant="outlined"
                @click="searchByTag(tag)"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Document Content -->
    <v-card elevation="1">
      <v-card-text class="pa-6">
        <div class="markdown-content">
          <div v-html="renderedContent"></div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Comments Section -->
    <v-card class="mt-4" elevation="1">
      <v-card-title>
        Commentaires ({{ comments.length }})
      </v-card-title>
      <v-card-text>
        <div v-if="comments.length === 0" class="text-center py-4 text-grey">
          Aucun commentaire pour le moment
        </div>
        <div v-else>
          <v-list>
            <v-list-item
              v-for="comment in comments"
              :key="comment.id"
              class="px-0"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <span class="text-caption">{{ getAuthorInitials(comment.author) }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ comment.author }}</v-list-item-title>
              <v-list-item-subtitle>
                <div class="mt-1">{{ comment.content }}</div>
                <div class="text-caption text-grey mt-1">{{ formatDate(comment.createdAt) }}</div>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <!-- Add Comment -->
        <v-textarea
          v-model="newComment"
          placeholder="Ajouter un commentaire..."
          variant="outlined"
          rows="3"
          class="mt-4"
        ></v-textarea>
        <v-btn
          color="primary"
          @click="addComment"
          :disabled="!newComment.trim()"
          class="mt-2"
        >
          Ajouter un commentaire
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import MarkdownIt from 'markdown-it'
import { documentsAPI } from '@/services/api'

export default {
  name: 'DocumentView',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const toast = useToast()

    const newComment = ref('')
    const md = new MarkdownIt()
    const loading = ref(true)

    // Document data (will be loaded from API)
    const document = ref({
      id: null,
      title: '',
      description: '',
      type: 'markdown',
      content: '',
      author: '',
      updatedAt: null,
      tags: []
    })

    const comments = ref([
      {
        id: 1,
        author: 'John Doe',
        content: 'Excellent guide ! Très utile pour commencer.',
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 2,
        author: 'Jane Smith',
        content: 'Pourrait-on ajouter une section sur les raccourcis clavier ?',
        createdAt: '2024-01-17T09:15:00Z'
      }
    ])

    const renderedContent = computed(() => {
      return md.render(document.value.content)
    })

    const getAuthorInitials = (author) => {
      return author.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const goBack = () => {
      // If document has a folder, navigate to that folder
      if (document.value.folderId) {
        router.push({
          name: 'Documents',
          query: { folder: document.value.folderId }
        })
      } else {
        // If document is in root, go to documents root
        router.push({ name: 'Documents' })
      }
    }

    const editDocument = () => {
      router.push(`/document/${document.value.id}/edit`)
    }

    const shareDocument = () => {
      toast.info('Fonctionnalité de partage en cours de développement')
    }

    const addComment = () => {
      if (newComment.value.trim()) {
        comments.value.push({
          id: Date.now(),
          author: authStore.fullName,
          content: newComment.value,
          createdAt: new Date().toISOString()
        })
        newComment.value = ''
        toast.success('Commentaire ajouté')
      }
    }

    const searchByTag = (tag) => {
      router.push(`/search?query=${encodeURIComponent(tag)}`)
    }

    // Load document from API
    const loadDocument = async () => {
      const documentId = route.params.id
      if (!documentId) {
        toast.error('ID de document manquant')
        router.push('/documents')
        return
      }

      try {
        loading.value = true
        const response = await documentsAPI.getById(documentId)
        const doc = response.data

        document.value = {
          id: doc.id,
          title: doc.title,
          description: doc.content?.substring(0, 100) || '',
          type: doc.contentType || 'markdown',
          content: doc.content || '',
          author: doc.creator ? `${doc.creator.firstName} ${doc.creator.lastName}` : 'Utilisateur inconnu',
          updatedAt: doc.updatedAt,
          folderId: doc.folderId,
          tags: doc.tags || []
        }
      } catch (error) {
        console.error('Error loading document:', error)
        toast.error('Erreur lors du chargement du document')
        router.push('/documents')
      } finally {
        loading.value = false
      }
    }

    // Load document on mount
    onMounted(() => {
      loadDocument()
    })

    return {
      authStore,
      document,
      comments,
      newComment,
      renderedContent,
      loading,
      getAuthorInitials,
      formatDate,
      goBack,
      editDocument,
      shareDocument,
      addComment,
      searchByTag
    }
  }
}
</script>

<style scoped>
.markdown-content {
  line-height: 1.7;
  font-size: 16px;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 2em;
  margin-bottom: 0.8em;
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 2.2em;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.8em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.markdown-content p {
  margin-bottom: 1.2em;
}

.markdown-content code {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.markdown-content pre {
  background-color: #f6f8fa;
  padding: 1.2em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.5em 0;
  border-left: 4px solid #0969da;
}

.markdown-content blockquote {
  border-left: 4px solid #d0d7de;
  padding-left: 1em;
  margin: 1.5em 0;
  color: #656d76;
  font-style: italic;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-content li {
  margin-bottom: 0.3em;
}
</style>
