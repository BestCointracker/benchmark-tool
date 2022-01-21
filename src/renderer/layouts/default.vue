<template>
  <v-app>
    <p class="text-h3 text-center mt-4">Benchmark tool</p>
    <nuxt />
  </v-app>
</template>

<script>
import appHeader from '@/components/header'

export default {
  name: 'DefaultLayout',
  components: { appHeader }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
