<template>
  <v-container fluid class="fill-height register-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="elevation-8" rounded="lg">
          <v-card-title class="text-center py-6">
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-4">mdi-account-plus</v-icon>
              <h1 class="text-h4 font-weight-light">Créer un compte</h1>
              <p class="text-subtitle-1 text-grey">Rejoignez Wiki App</p>
            </div>
          </v-card-title>

          <v-card-text class="px-8 pb-8">
            <v-form ref="form" @submit.prevent="handleRegister">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="firstName"
                    label="Prénom"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="firstNameRules"
                    :error-messages="firstNameErrors"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="lastName"
                    label="Nom de famille"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="lastNameRules"
                    :error-messages="lastNameErrors"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

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

              <v-text-field
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                :rules="confirmPasswordRules"
                :error-messages="confirmPasswordErrors"
                class="mb-3"
                required
              ></v-text-field>

              <v-checkbox
                v-model="acceptTerms"
                :rules="termsRules"
                class="mb-4"
              >
                <template v-slot:label>
                  <div>
                    J'accepte les 
                    <v-btn text size="small" color="primary">conditions d'utilisation</v-btn>
                    et la 
                    <v-btn text size="small" color="primary">politique de confidentialité</v-btn>
                  </div>
                </template>
              </v-checkbox>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-4"
              >
                Créer mon compte
              </v-btn>

              <div class="text-center">
                <span class="text-grey">Déjà un compte ?</span>
                <v-btn text color="primary" @click="$router.push('/login')">
                  Se connecter
                </v-btn>
              </div>
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
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()

    const form = ref(null)
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const acceptTerms = ref(false)
    const loading = ref(false)

    // Error messages
    const firstNameErrors = ref([])
    const lastNameErrors = ref([])
    const emailErrors = ref([])
    const passwordErrors = ref([])
    const confirmPasswordErrors = ref([])

    // Validation rules
    const firstNameRules = [
      v => !!v || 'Le prénom est requis',
      v => (v && v.length >= 2) || 'Le prénom doit contenir au moins 2 caractères'
    ]

    const lastNameRules = [
      v => !!v || 'Le nom de famille est requis',
      v => (v && v.length >= 2) || 'Le nom de famille doit contenir au moins 2 caractères'
    ]

    const emailRules = [
      v => !!v || 'L\'email est requis',
      v => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const passwordRules = [
      v => !!v || 'Le mot de passe est requis',
      v => (v && v.length >= 6) || 'Le mot de passe doit contenir au moins 6 caractères',
      v => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ]

    const confirmPasswordRules = [
      v => !!v || 'La confirmation du mot de passe est requise',
      v => v === password.value || 'Les mots de passe ne correspondent pas'
    ]

    const termsRules = [
      v => !!v || 'Vous devez accepter les conditions d\'utilisation'
    ]

    const handleRegister = async () => {
      // Clear previous errors
      firstNameErrors.value = []
      lastNameErrors.value = []
      emailErrors.value = []
      passwordErrors.value = []
      confirmPasswordErrors.value = []

      const { valid } = await form.value.validate()
      if (!valid) return

      loading.value = true

      try {
        await authStore.register({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value
        })

        toast.success('Compte créé avec succès ! Un email de bienvenue vous a été envoyé.')
        router.push('/')
      } catch (error) {
        console.error('Registration error:', error)
        
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            switch (err.path) {
              case 'firstName':
                firstNameErrors.value.push(err.msg)
                break
              case 'lastName':
                lastNameErrors.value.push(err.msg)
                break
              case 'email':
                emailErrors.value.push(err.msg)
                break
              case 'password':
                passwordErrors.value.push(err.msg)
                break
            }
          })
        } else {
          toast.error(error.response?.data?.error || 'Erreur lors de la création du compte')
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      acceptTerms,
      loading,
      firstNameErrors,
      lastNameErrors,
      emailErrors,
      passwordErrors,
      confirmPasswordErrors,
      firstNameRules,
      lastNameRules,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      termsRules,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.v-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}
</style>