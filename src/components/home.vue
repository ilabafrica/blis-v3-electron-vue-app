<template>
  <div v-if='isAuthenticated && isProfileLoaded'>
    Dashboard{blis generic flow}
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'

  export default {
    name:'Home',
    computed: {
      ...mapGetters(['isAuthenticated', 'isProfileLoaded']),
    }
  }
</script>