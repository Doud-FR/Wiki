<template>
  <v-container fluid class="fill-height login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-lock-reset</v-icon>
              <h1 class="text-h4 font-weight-light">Mot de passe oublié</h1>
              <p class="text-subtitle-1 text-grey">Entrez votre email pour recevoir un lien de réinitialisation</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8 pb-8">
            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              {{ successMessage }}
            </v-alert>

            <v-form ref="form" @submit.prevent="handleForgotPassword" v-if="!successMessage">
              <v-text-field
                v-model="email"
                label="Adresse email"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :rules="emailRules"
                :error-messages="emailErrors"
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
                Envoyer le lien de réinitialisation
              </v-btn>
            </v-form>

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
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { authAPI } from '@/services/api'

export default {
  name: 'ForgotPassword',
  setup () {
    const toast = useToast()

    const form = ref(null)
    const email = ref('')
    const loading = ref(false)
    const emailErrors = ref([])
    const successMessage = ref('')

    const emailRules = [
      v => !!v || 'L\'email est requis',
      v => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const handleForgotPassword = async () => {
      emailErrors.value = []

      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true

      try {
        await authAPI.forgotPassword(email.value)
        successMessage.value = 'Un email avec les instructions de réinitialisation a été envoyé si l\'adresse existe.'
        toast.success('Email de réinitialisation envoyé')
      } catch (error) {
        console.error('Forgot password error:', error)

        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            if (err.path === 'email') {
              emailErrors.value.push(err.msg)
            }
          })
        } else {
          toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      email,
      loading,
      emailErrors,
      successMessage,
      emailRules,
      handleForgotPassword
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
