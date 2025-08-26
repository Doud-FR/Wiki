<template>
  <!-- Welcome screen for non-authenticated users -->
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
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Home',
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()

    onMounted(() => {
      // Redirect authenticated users to documents page
      if (authStore.isAuthenticated) {
        router.push('/documents')
      }
    })

    return {
      authStore
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.gap-3 > * + * {
  margin-top: 12px;
}
</style>
