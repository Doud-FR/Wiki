<template>
  <v-container fluid class="fill-height login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-lock-reset</v-icon>
              <h1 class="text-h4 font-weight-light">Nouveau mot de passe</h1>
              <p class="text-subtitle-1 text-grey">Choisissez un nouveau mot de passe</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8 pb-8">
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ errorMessage }}
            </v-alert>

            <v-form ref="form" @submit.prevent="handleResetPassword" v-if="!successMessage">
              <v-text-field
                v-model="newPassword"
                label="Nouveau mot de passe"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                :rules="passwordRules"
                :error-messages="passwordErrors"
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                :rules="confirmPasswordRules"
                :error-messages="confirmPasswordErrors"
                class="mb-3"
                required
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                Réinitialiser le mot de passe
              </v-btn>
            </v-form>

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              {{ successMessage }}
            </v-alert>

            <div class="text-center">
              <v-btn
                text
                color="primary"
                @click="$router.push('/login')"
              >
                Retour à la connexion
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { authAPI } from '@/services/api'

export default {
  name: 'ResetPassword',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()

    const form = ref(null)
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const passwordErrors = ref([])
    const confirmPasswordErrors = ref([])
    const errorMessage = ref('')
    const successMessage = ref('')
    const resetToken = ref('')

    const passwordRules = [
      v => !!v || 'Le mot de passe est requis',
      v => (v && v.length >= 6) || 'Le mot de passe doit contenir au moins 6 caractères'
    ]

    const confirmPasswordRules = [
      v => !!v || 'La confirmation du mot de passe est requise',
      v => v === newPassword.value || 'Les mots de passe ne correspondent pas'
    ]

    const handleResetPassword = async () => {
      passwordErrors.value = []
      confirmPasswordErrors.value = []
      errorMessage.value = ''

      const { valid } = await form.value.validate()
      if (!valid) return

      if (newPassword.value !== confirmPassword.value) {
        confirmPasswordErrors.value.push('Les mots de passe ne correspondent pas')
        return
      }

      loading.value = true

      try {
        await authAPI.resetPassword(resetToken.value, newPassword.value)
        successMessage.value = 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
        toast.success('Mot de passe réinitialisé avec succès')

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } catch (error) {
        console.error('Reset password error:', error)

        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            if (err.path === 'newPassword') {
              passwordErrors.value.push(err.msg)
            }
          })
        } else {
          errorMessage.value = error.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe'
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      resetToken.value = route.query.token
      if (!resetToken.value) {
        errorMessage.value = 'Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.'
      }
    })

    return {
      form,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      passwordErrors,
      confirmPasswordErrors,
      errorMessage,
      successMessage,
      passwordRules,
      confirmPasswordRules,
      handleResetPassword
    }
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.v-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}
</style>
