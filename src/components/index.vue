<template>
  <v-app :class="{blis_bg:isAuthenticated}">
    <v-navigation-drawer v-if='isAuthenticated && isProfileLoaded' v-model="drawer" fixed app>
      <sidebar></sidebar>
    </v-navigation-drawer>
    <v-toolbar v-if="isAuthenticated && isProfileLoaded" color="white" class="elevation-1" fixed app id="blis_main_toolbar">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>BLISv3.0</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y id="profile_menu">
        <v-btn primary flat slot="activator">
          <v-flex
            xs12
            sm6
            md8
            align-center
            justify-center
            layout
            text-xs-center
          >
            <v-avatar
              :size="45"
              color="grey lighten-4"
              class="mr-2"
            >
              <img :src="'storage/profile_pictures/'+pic" alt="">
            </v-avatar>
          </v-flex>
          {{name}}
        </v-btn>
        <v-list>
          <v-list-tile to="/account/profile">
            <v-list-tile-title>Edit Profile</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="logout">
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-container fluid style="padding-top:80px;" id="blis-main-container">
        <loading v-if='authLoading'></loading>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer v-if='isAuthenticated && isProfileLoaded' color="primary" app>
      <v-card-text class="white--text">
        &copy; {{ new Date().getFullYear() }} — <strong>@iLabAfrica</strong>
      </v-card-text>

      
    </v-footer>
  </v-app>
</template>
<style>
  #app{
    background: #11002A;
  }
  #blis_main_toolbar .v-toolbar__content{
    padding-right:0px;
  }
  #app.blis_bg{
    background: #F6F2FF;
    /* background-blend-mode: overlay;
    background-size: cover;
    background-image: url("https://images.pexels.com/photos/954585/pexels-photo-954585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"); */
  }  
  .v-list__tile__action{
    max-width: 56px !important;
  }
  .v-icon {
    max-width: 56px !important;
  }
  #profile_menu, #profile_menu .v-menu__activator, #profile_menu button{
    height: 100%;
    background: #E5E5E5;
    border-radius: 40px 0 0 40px;
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
      loading: false,
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
        pic: state =>  `${state.user.profile.profile_picture}`,
      })
    },
  }
</script>