<template>
  <v-app flat>
    <v-main>
        <Nuxt />
    </v-main>
  </v-app>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'

export default Vue.extend({
    data():  any {
        return {
            clipped: false,
            drawer: false,
            fixed: false,
            items: [
                {
                    icon: 'mdi-apps',
                    title: 'Welcome',
                    to: '/'
                }
            ],
            miniVariant: false,
            right: true,
            rightDrawer: false,
            title: 'Superchat viewer',
        }
    },
})
</script>
