<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title class="text-h5 pa-6">
            <v-icon class="mr-3">mdi-account</v-icon>
            Profil utilisateur
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="profileForm" @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" class="text-center mb-4">
                  <v-avatar size="80" color="primary">
                    <span class="text-h4 white--text">{{ userInitials }}</span>
                  </v-avatar>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.firstName"
                    label="Prénom"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.lastName"
                    label="Nom"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="profile.email"
                label="Adresse email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                :rules="emailRules"
                disabled
              ></v-text-field>

              <v-list class="bg-transparent pa-0">
                <v-list-item class="px-0">
                  <v-list-item-title>Statut</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="authStore.isAdmin ? 'red' : 'primary'"
                      variant="flat"
                      size="small"
                    >
                      {{ authStore.isAdmin ? 'Administrateur' : 'Utilisateur' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0" v-if="authStore.user?.lastLoginAt">
                  <v-list-item-title>Dernière connexion</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(authStore.user.lastLoginAt) }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0" v-if="authStore.user?.createdAt">
                  <v-list-item-title>Membre depuis</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(authStore.user.createdAt) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-4"></v-divider>

              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                prepend-icon="mdi-content-save"
              >
                Sauvegarder les modifications
              </v-btn>
            </v-form>

            <v-divider class="my-6"></v-divider>

            <!-- Change Password Section -->
            <h3 class="text-h6 mb-4">Changer le mot de passe</h3>

            <v-form ref="passwordForm" @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordData.currentPassword"
                label="Mot de passe actuel"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                type="password"
                :rules="passwordRules"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="passwordData.newPassword"
                label="Nouveau mot de passe"
                prepend-inner-icon="mdi-lock-plus"
                variant="outlined"
                type="password"
                :rules="newPasswordRules"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="passwordData.confirmPassword"
                label="Confirmer le nouveau mot de passe"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
                type="password"
                :rules="confirmPasswordRules"
                class="mb-3"
              ></v-text-field>

              <v-btn
                type="submit"
                color="warning"
                :loading="passwordLoading"
                prepend-icon="mdi-lock-reset"
              >
                Changer le mot de passe
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Profile',
  setup () {
    const authStore = useAuthStore()
    const toast = useToast()

    const profileForm = ref(null)
    const passwordForm = ref(null)
    const loading = ref(false)
    const passwordLoading = ref(false)

    const profile = reactive({
      firstName: '',
      lastName: '',
      email: ''
    })

    const passwordData = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const userInitials = computed(() => {
      if (!authStore.user) return '?'
      const first = authStore.user.firstName?.[0] || ''
      const last = authStore.user.lastName?.[0] || ''
      return (first + last).toUpperCase()
    })

    const nameRules = [
      v => !!v || 'Ce champ est requis',
      v => (v && v.length >= 2) || 'Le nom doit contenir au moins 2 caractères'
    ]

    const emailRules = [
      v => !!v || 'L\'email est requis',
      v => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const passwordRules = [
      v => !!v || 'Le mot de passe est requis'
    ]

    const newPasswordRules = [
      v => !!v || 'Le nouveau mot de passe est requis',
      v => (v && v.length >= 6) || 'Le mot de passe doit contenir au moins 6 caractères'
    ]

    const confirmPasswordRules = [
      v => !!v || 'La confirmation est requise',
      v => v === passwordData.newPassword || 'Les mots de passe ne correspondent pas'
    ]

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadProfile = () => {
      if (authStore.user) {
        profile.firstName = authStore.user.firstName || ''
        profile.lastName = authStore.user.lastName || ''
        profile.email = authStore.user.email || ''
      }
    }

    const updateProfile = async () => {
      const { valid } = await profileForm.value.validate()
      if (!valid) return

      loading.value = true
      try {
        await authStore.updateProfile(profile)
        toast.success('Profil mis à jour avec succès')
      } catch (error) {
        toast.error('Erreur lors de la mise à jour du profil')
      } finally {
        loading.value = false
      }
    }

    const changePassword = async () => {
      const { valid } = await passwordForm.value.validate()
      if (!valid) return

      passwordLoading.value = true
      try {
        await authStore.changePassword(passwordData.currentPassword, passwordData.newPassword)
        toast.success('Mot de passe modifié avec succès')

        // Reset form
        passwordData.currentPassword = ''
        passwordData.newPassword = ''
        passwordData.confirmPassword = ''
      } catch (error) {
        toast.error('Erreur lors du changement de mot de passe')
      } finally {
        passwordLoading.value = false
      }
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      authStore,
      profileForm,
      passwordForm,
      loading,
      passwordLoading,
      profile,
      passwordData,
      userInitials,
      nameRules,
      emailRules,
      passwordRules,
      newPasswordRules,
      confirmPasswordRules,
      formatDate,
      updateProfile,
      changePassword
    }
  }
}
</script>
