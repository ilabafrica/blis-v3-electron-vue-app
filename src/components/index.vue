<template>
  <v-app :class="{blis_bg:isAuthenticated}">
    <v-navigation-drawer v-if='isAuthenticated && isProfileLoaded' v-model="drawer" fixed app>
      <Sidebar/>
    </v-navigation-drawer>
    <v-toolbar v-if="isAuthenticated && isProfileLoaded" color="white" class="elevation-1 primary--text" fixed app>   
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <v-btn blue flat slot="activator"><v-icon left>developer_board</v-icon> {{name}}</v-btn>
        <v-list>
            <v-list-tile @click="logout">
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-layout row justify-end primary id="blis-title-bar" class=" white--text">
      <div class="v-toolbar__title ml-3 mt-2" >BLISv3.0</div>
      <v-flex class="blis-dragable"></v-flex>
      <v-btn @click="closeApp" white white--text flat style="margin:0px; height:100%;"><v-icon>close</v-icon></v-btn>

    </v-layout>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer v-if='isAuthenticated && isProfileLoaded' color="primary" style="white--text" app dark>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>
<style scoped>
  #app{
    background: rgba(25, 118, 210, 0.3);
    background-blend-mode: hard-light;
    background-size: cover;
    background-image: url("https://images.pexels.com/photos/954585/pexels-photo-954585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  }
  #app.blis_bg{
    background: rgba(255, 255, 255, 0.9);
    background-blend-mode: overlay;
    background-size: cover;
    background-image: url("https://images.pexels.com/photos/954585/pexels-photo-954585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  }  
  .blis-dragable{    
    -webkit-app-region: drag;
  }
  #blis-title-bar{
    width: 100%;
    height: 50px;
    position: fixed;
    top: 0px;
    z-index: 10;
  }
  #app.blis_bg #blis-title-bar{
    height: 45px;
  }
  nav, aside.v-navigation-drawer{
    margin-top:40px !important;
  }
  main{
    padding-top:100px !important;
  }
</style>
<script>
import {remote} from 'electron'
import HelloWorld from './HelloWorld'
import Sidebar from './sidebar'
import { mapGetters, mapState } from 'vuex'
import { AUTH_LOGOUT } from '../store/actions/auth'
import { USER_REQUEST } from '../store/actions/user'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Sidebar
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
    },
    closeApp:()=>{
      remote.app.quit()
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
