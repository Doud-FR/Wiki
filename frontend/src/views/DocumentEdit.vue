<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.back()"
              class="mr-3"
            ></v-btn>
            <div>
              <h1 class="text-h5">{{ isNew ? 'Nouveau document' : 'Éditer le document' }}</h1>
              <p class="text-subtitle-2 text-grey mb-0">{{ isNew ? 'Créez un nouveau document' : document.name }}</p>
            </div>
          </div>

          <div>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-eye"
              @click="previewMode = !previewMode"
              class="mr-2"
            >
              {{ previewMode ? 'Éditer' : 'Aperçu' }}
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveDocument"
              :loading="saving"
            >
              Sauvegarder
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Document metadata -->
    <v-row v-if="isNew" class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="document.name"
          label="Nom du document"
          variant="outlined"
          prepend-inner-icon="mdi-file-document"
          :rules="nameRules"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="document.type"
          :items="documentTypes"
          label="Type de document"
          variant="outlined"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Editor -->
    <v-row>
      <v-col cols="12">
        <v-card class="editor-card">
          <v-card-text class="pa-0">
            <!-- Toolbar -->
            <v-toolbar density="compact" color="grey-lighten-4" v-if="!previewMode">
              <v-btn icon="mdi-format-bold" variant="text" size="small" @click="insertMarkdown('**', '**')"></v-btn>
              <v-btn icon="mdi-format-italic" variant="text" size="small" @click="insertMarkdown('*', '*')"></v-btn>
              <v-btn icon="mdi-format-header-1" variant="text" size="small" @click="insertMarkdown('# ', '')"></v-btn>
              <v-btn icon="mdi-format-header-2" variant="text" size="small" @click="insertMarkdown('## ', '')"></v-btn>
              <v-btn icon="mdi-format-list-bulleted" variant="text" size="small" @click="insertMarkdown('- ', '')"></v-btn>
              <v-btn icon="mdi-format-list-numbered" variant="text" size="small" @click="insertMarkdown('1. ', '')"></v-btn>
              <v-btn icon="mdi-link" variant="text" size="small" @click="insertMarkdown('[', '](url)')"></v-btn>
              <v-btn icon="mdi-code-tags" variant="text" size="small" @click="insertMarkdown('`', '`')"></v-btn>
              <v-btn icon="mdi-format-quote-close" variant="text" size="small" @click="insertMarkdown('> ', '')"></v-btn>
            </v-toolbar>

            <!-- Editor or Preview -->
            <div class="editor-container">
              <v-textarea
                v-if="!previewMode"
                ref="editor"
                v-model="document.content"
                placeholder="Commencez à écrire votre document en Markdown..."
                variant="plain"
                hide-details
                auto-grow
                rows="20"
                class="editor-textarea"
              ></v-textarea>

              <div v-else class="preview-content pa-6" v-html="renderedContent"></div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick guide for new users -->
    <v-row v-if="showGuide" class="mt-4">
      <v-col cols="12">
        <v-card color="info" variant="tonal">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            Guide rapide Markdown
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="showGuide = false"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-2">Formatage de base</h3>
                <div class="text-body-2">
                  <code>**gras**</code> → <strong>gras</strong><br>
                  <code>*italique*</code> → <em>italique</em><br>
                  <code>`code`</code> → <code>code</code>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-2">Structure</h3>
                <div class="text-body-2">
                  <code># Titre 1</code><br>
                  <code>## Titre 2</code><br>
                  <code>- Liste à puces</code><br>
                  <code>1. Liste numérotée</code>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { documentsAPI } from '@/services/api'

export default {
  name: 'DocumentEdit',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()

    const editor = ref(null)
    const saving = ref(false)
    const previewMode = ref(false)
    const showGuide = ref(true)

    const document = reactive({
      id: null,
      name: '',
      content: '',
      type: 'markdown'
    })

    const isNew = computed(() => route.params.id === undefined || route.name === 'DocumentNew')

    const documentTypes = [
      { title: 'Markdown', value: 'markdown' },
      { title: 'Document Word', value: 'docx' }
    ]

    const nameRules = [
      v => !!v || 'Le nom du document est requis',
      v => (v && v.length >= 2) || 'Le nom doit contenir au moins 2 caractères'
    ]

    // Simple markdown to HTML renderer (basic implementation)
    const renderedContent = computed(() => {
      if (!document.content) return '<p class="text-grey">Commencez à écrire pour voir l\'aperçu...</p>'

      const html = document.content
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        // Code inline
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
        // Line breaks
        .replace(/\n/gim, '<br>')
        // Lists (basic)
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')

      return html
    })

    const insertMarkdown = (before, after) => {
      if (!editor.value) return

      const textarea = editor.value.$el.querySelector('textarea')
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = document.content.substring(start, end)

      const replacement = before + selectedText + after
      document.content = document.content.substring(0, start) + replacement + document.content.substring(end)

      // Move cursor to after the inserted text
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
      }, 0)
    }

    const loadDocument = async () => {
      if (!isNew.value && route.params.id) {
        try {
          const response = await documentsAPI.getById(route.params.id)
          const doc = response.data
          document.id = doc.id
          document.name = doc.title
          document.content = doc.content || ''
          document.type = doc.contentType || 'markdown'
        } catch (error) {
          console.error('Error loading document:', error)
          toast.error('Erreur lors du chargement du document')
          router.push('/documents')
        }
      } else {
        // New document
        document.id = null
        document.name = ''
        document.content = ''
        document.type = 'markdown'
      }
    }

    const saveDocument = async () => {
      if (isNew.value && !document.name.trim()) {
        toast.error('Veuillez saisir un nom pour le document')
        return
      }

      saving.value = true

      try {
        if (isNew.value) {
          // Create new document
          const documentData = {
            name: document.name,
            description: document.content,
            type: document.type
          }
          const response = await documentsAPI.create(documentData)
          const newDoc = response.data

          document.id = newDoc.id
          toast.success('Document créé avec succès')

          // Redirect to edit the newly created document
          router.push(`/document/${newDoc.id}/edit`)
        } else {
          // Update existing document
          const documentData = {
            title: document.name,
            content: document.content,
            contentType: document.type
          }
          await documentsAPI.update(document.id, documentData)
          toast.success('Document sauvegardé avec succès')
        }
      } catch (error) {
        console.error('Error saving document:', error)
        toast.error('Erreur lors de la sauvegarde du document')
      } finally {
        saving.value = false
      }
    }

    // Auto-save every 30 seconds
    let autoSaveTimer = null
    const startAutoSave = () => {
      autoSaveTimer = setInterval(() => {
        if (document.content && !isNew.value) {
          saveDocument()
        }
      }, 30000)
    }

    const stopAutoSave = () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer)
      }
    }

    // Watch for content changes to show unsaved indicator
    watch(() => document.content, () => {
      // Here you could add an unsaved changes indicator
    })

    onMounted(() => {
      loadDocument()
      startAutoSave()
    })

    // Cleanup on unmount
    watch(() => route.path, () => {
      stopAutoSave()
    })

    return {
      editor,
      saving,
      previewMode,
      showGuide,
      document,
      isNew,
      documentTypes,
      nameRules,
      renderedContent,
      insertMarkdown,
      saveDocument
    }
  }
}
</script>

<style scoped>
.editor-card {
  min-height: 500px;
}

.editor-container {
  min-height: 400px;
}

.editor-textarea :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  min-height: 400px;
}

.preview-content {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.preview-content :deep(h1) {
  font-size: 2rem;
  margin: 1rem 0;
}

.preview-content :deep(h2) {
  font-size: 1.5rem;
  margin: 0.8rem 0;
}

.preview-content :deep(h3) {
  font-size: 1.2rem;
  margin: 0.6rem 0;
}

.preview-content :deep(code) {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.preview-content :deep(li) {
  margin: 0.2rem 0;
}
</style>
