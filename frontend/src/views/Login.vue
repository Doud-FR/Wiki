<template>
  <v-container fluid class="fill-height login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-8" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-book-open-page-variant</v-icon>
              <h1 class="text-h4 font-weight-light">Wiki App</h1>
              <p class="text-subtitle-1 text-grey">Connexion à votre compte</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8 pb-8">
            <v-form ref="form" @submit.prevent="handleLogin">
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

              <v-text-field
                v-model="password"
                label="Mot de passe"
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

              <v-row class="mb-4">
                <v-col cols="6">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Se souvenir de moi"
                    density="compact"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-btn text size="small" color="primary">
                    Mot de passe oublié ?
                  </v-btn>
                </v-col>
              </v-row>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                Se connecter
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()

    const form = ref(null)
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const rememberMe = ref(false)
    const loading = ref(false)
    const emailErrors = ref([])
    const passwordErrors = ref([])

    const emailRules = [
      v => !!v || 'L\'email est requis',
      v => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const passwordRules = [
      v => !!v || 'Le mot de passe est requis',
      v => (v && v.length >= 6) || 'Le mot de passe doit contenir au moins 6 caractères'
    ]

    const handleLogin = async () => {
      emailErrors.value = []
      passwordErrors.value = []

      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true

      try {
        await authStore.login(email.value, password.value)
        toast.success('Connexion réussie ! Bienvenue.')
        router.push('/')
      } catch (error) {
        console.error('Login error:', error)

        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            if (err.path === 'email') {
              emailErrors.value.push(err.msg)
            } else if (err.path === 'password') {
              passwordErrors.value.push(err.msg)
            }
          })
        } else {
          toast.error(error.response?.data?.error || 'Erreur de connexion')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      email,
      password,
      showPassword,
      rememberMe,
      loading,
      emailErrors,
      passwordErrors,
      emailRules,
      passwordRules,
      handleLogin
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
