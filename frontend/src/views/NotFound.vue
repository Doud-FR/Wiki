<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="100" color="grey" class="mb-4">mdi-file-search</v-icon>
        <h1 class="text-h2 font-weight-light mb-4">404</h1>
        <h2 class="text-h4 mb-4">Page non trouvée</h2>
        <p class="text-subtitle-1 text-grey mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <v-btn color="primary" size="large" @click="$router.push('/')">
          Retour à l'accueil
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>