<template>
  <v-app>
    <v-navigation-drawer v-if='isAuthenticated && isProfileLoaded' v-model="drawer" fixed app>
      <Sidebar/>
    </v-navigation-drawer>
    <v-toolbar v-if="isAuthenticated && isProfileLoaded" color="primary" class="elevation-1" dark fixed app>   
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>BLISv3.0</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <v-btn primary flat slot="activator"><v-icon left>developer_board</v-icon> {{name}}</v-btn>
        <v-list>
            <v-list-tile @click="logout">
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <div id="blis-title-bar" class="secondary">

    </div>
    <v-content>
      <v-container fluid>
        <Loading v-if='authLoading'/>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer v-if='isAuthenticated && isProfileLoaded' color="primary" app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>
<style scoped>
  #blis-title-bar{
    -webkit-app-region: drag;
    width: 100%;
    height: 20px;
    position: fixed;
    top: 0px;
    z-index: 10;
  }
  nav, aside.v-navigation-drawer{
    margin-top:20px;
  }
</style>
<script>
import HelloWorld from './HelloWorld'
import Sidebar from './sidebar'
import Loading from './loading'
import { mapGetters, mapState } from 'vuex'
import { AUTH_LOGOUT } from '../store/actions/auth'
import { USER_REQUEST } from '../store/actions/user'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Sidebar, 
    Loading
  },
  created: function () {
    if (this.$store.getters.isAuthenticated) {
      this.$store.dispatch(USER_REQUEST)
    }
  },
  data: () => ({
    user: {},
    drawer: null
  }),
  methods: {
    logout: function () {
      this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/login'))
    }
  },
  computed: {
    ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
    ...mapState({
      authLoading: state => state.auth.status === 'loading',
      name: state => `${state.user.profile.name}`,
    })
  },
}
</script>
