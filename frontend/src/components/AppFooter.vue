<template>
  <v-footer color="grey-lighten-4" class="mt-auto">
    <div class="d-flex justify-space-between align-center w-100 px-4">
      <div class="text-caption">
        © 2024 Wiki App - Documentation Collaborative
      </div>

      <div class="d-flex align-center">
        <v-btn icon size="small" href="https://github.com" target="_blank" class="mr-2">
          <v-icon>mdi-github</v-icon>
        </v-btn>

        <v-btn icon size="small" @click="toggleTheme">
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
      </div>
    </div>
  </v-footer>
</template>

<script>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

export default {
  name: 'AppFooter',
  setup () {
    const theme = useTheme()

    const isDark = computed(() => theme.global.name.value === 'dark')

    const toggleTheme = () => {
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    }

    return {
      isDark,
      toggleTheme
    }
  }
}
</script>
