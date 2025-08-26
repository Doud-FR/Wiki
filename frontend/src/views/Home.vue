<template>
  <!-- Public welcome page for non-authenticated users -->
  <v-container v-if="!authStore.isAuthenticated" fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8" lg="6">
        <v-card class="elevation-4" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-book-open-page-variant</v-icon>
              <h1 class="text-h4 font-weight-light">Bienvenue sur Wiki App</h1>
              <p class="text-subtitle-1 text-grey">Votre plateforme de documentation collaborative</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8">
            <v-row>
              <v-col cols="12" md="6">
                <div class="d-flex flex-column h-100">
                  <h2 class="text-h5 mb-4">Fonctionnalités principales</h2>

                  <v-list class="bg-transparent">
                    <v-list-item prepend-icon="mdi-folder-tree" class="px-0">
                      <v-list-item-title>Organisation hiérarchique</v-list-item-title>
                      <v-list-item-subtitle>Structurez vos documents avec des dossiers</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-account-group" class="px-0">
                      <v-list-item-title>Gestion des utilisateurs</v-list-item-title>
                      <v-list-item-subtitle>Contrôlez l'accès avec des groupes et permissions</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-markdown" class="px-0">
                      <v-list-item-title>Édition Markdown</v-list-item-title>
                      <v-list-item-subtitle>Créez du contenu riche facilement</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-magnify" class="px-0">
                      <v-list-item-title>Recherche avancée</v-list-item-title>
                      <v-list-item-subtitle>Trouvez rapidement vos documents</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item prepend-icon="mdi-email" class="px-0">
                      <v-list-item-title>Notifications email</v-list-item-title>
                      <v-list-item-subtitle>Restez informé des nouveautés</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="d-flex flex-column align-center justify-center h-100">
                  <v-icon size="120" color="primary" class="mb-6">mdi-rocket-launch</v-icon>

                  <h3 class="text-h5 mb-4 text-center">Commencez dès maintenant</h3>

                  <p class="text-center text-grey mb-6">
                    Connectez-vous pour accéder à votre plateforme de documentation collaborative.
                  </p>

                  <div class="d-flex flex-column gap-3 w-100" style="max-width: 300px;">
                    <v-btn
                      color="primary"
                      size="large"
                      block
                      prepend-icon="mdi-login"
                      @click="$router.push('/login')"
                    >
                      Se connecter
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-center py-6">
            <div class="text-center">
              <p class="text-caption text-grey mb-2">
                Plateforme sécurisée avec chiffrement des données
              </p>
              <div class="d-flex justify-center align-center">
                <v-icon size="16" color="success" class="mr-1">mdi-shield-check</v-icon>
                <span class="text-caption text-success">SSL/TLS</span>
                <v-icon size="16" color="success" class="mx-2">mdi-database-lock</v-icon>
                <span class="text-caption text-success">Base de données sécurisée</span>
              </div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Dashboard for authenticated users -->
  <v-container v-if="authStore.isAuthenticated" fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="10" lg="8">
        <v-card class="elevation-4" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-book-open-page-variant</v-icon>
              <h1 class="text-h4 font-weight-light">Bienvenue, {{ authStore.fullName }}!</h1>
              <p class="text-subtitle-1 text-grey">Votre espace de documentation collaborative</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8">
            <v-row>
              <v-col cols="12" md="6">
                <h2 class="text-h5 mb-4">Actions rapides</h2>
                <div class="d-flex flex-column gap-3">
                  <v-btn
                    color="primary"
                    size="large"
                    prepend-icon="mdi-file-document-plus"
                    @click="$router.push('/documents/new')"
                    block
                  >
                    Créer un document
                  </v-btn>
                  <v-btn
                    color="secondary"
                    size="large"
                    prepend-icon="mdi-folder-plus"
                    @click="showCreateFolderDialog = true"
                    block
                  >
                    Créer un dossier
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    prepend-icon="mdi-file-document-multiple"
                    @click="$router.push('/documents')"
                    block
                  >
                    Parcourir les documents
                  </v-btn>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <h2 class="text-h5 mb-4">Statistiques</h2>
                <v-list class="bg-transparent">
                  <v-list-item prepend-icon="mdi-file-document" class="px-0">
                    <v-list-item-title>Documents récents</v-list-item-title>
                    <v-list-item-subtitle>{{ recentDocumentsCount }} documents modifiés cette semaine</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item prepend-icon="mdi-folder" class="px-0">
                    <v-list-item-title>Dossiers</v-list-item-title>
                    <v-list-item-subtitle>{{ foldersCount }} dossiers organisés</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="authStore.isAdmin" prepend-icon="mdi-account-group" class="px-0">
                    <v-list-item-title>Utilisateurs</v-list-item-title>
                    <v-list-item-subtitle>{{ usersCount }} utilisateurs actifs</v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <div v-if="authStore.isAdmin" class="mt-4">
                  <h3 class="text-h6 mb-2">Administration</h3>
                  <v-btn
                    variant="outlined"
                    color="warning"
                    prepend-icon="mdi-cog"
                    @click="$router.push('/admin')"
                    block
                  >
                    Panneau d'administration
                  </v-btn>
                </div>
              </v-col>
            </v-row>
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
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Home',
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()

    const showCreateFolderDialog = ref(false)
    const newFolderName = ref('')

    // Mock data for dashboard stats
    const recentDocumentsCount = ref(12)
    const foldersCount = ref(8)
    const usersCount = ref(25)

    const createFolder = () => {
      if (newFolderName.value.trim()) {
        toast.success(`Dossier "${newFolderName.value}" créé avec succès`)
        newFolderName.value = ''
        showCreateFolderDialog.value = false
        router.push('/documents')
      }
    }

    return {
      authStore,
      showCreateFolderDialog,
      newFolderName,
      recentDocumentsCount,
      foldersCount,
      usersCount,
      createFolder
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gap-3 > * + * {
  margin-top: 12px;
}

/* Ensure cursor pointer for clickable elements */
.cursor-pointer {
  cursor: pointer;
}
</style>
