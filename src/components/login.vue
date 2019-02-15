<template>
  <div id="inspire">    
    <v-card class="elevation-3" id="blis-login-card">
      <v-alert
        v-model="alert"
        
        align-right
        icon="warning"
        transition="scale-transition"
        color="error"
        dismissible>
        {{message}}
      </v-alert>      
      <Loading v-if='authLoading'/>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>BLIS</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-form ref="form" v-model="valid" lazy-validation>
      <v-card-text>
        <v-text-field
          v-model="username"
          :rules="usernameRules"
          prepend-icon="person"
          name="username"
          label="Email"
          type="text">
        </v-text-field>
        <v-text-field
          v-model="password"
          prepend-icon="lock"
          :rules="[v => !!v || 'Password is Required']"
          name="password"
          label="Password"
          type="password">
        </v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" round :disabled="!valid" @click="login" :loading="loading">
          Login
        </v-btn>
      </v-card-actions>
    </v-form>
    </v-card>
  </div>
</template>

<style>
  main{
    padding-top:0px !important;
  }
  #blis-login-card{
    position: absolute;
    top:20vh;
    right:10vw;
    min-width: 400px;
    width:50vw;
    max-width: 800px;
  }
</style>


<script>
  import {AUTH_REQUEST} from '../store/actions/auth'
  import Loading from './loading'
  import { mapState } from 'vuex'
  export default {
    name: 'Login',
    components: {
      Loading
    },
    data() {
      return {
        loading: false,
        alert: false,
        valid: true,
        message: '',
        username: '',
        usernameRules: [
          v => !!v || 'E-mail is required',
          v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,5})+$/.test(v) || 'E-mail must be valid'
        ],
        password: '',
      };
    },
    methods: {
      login () {
        if (this.$refs.form.validate()) {
          this.loading = true
          const { username, password } = this
          this.$store.dispatch(AUTH_REQUEST, { username, password })
          .then((response) => {
            this.loading = false
            this.$router.push('/')
          }).catch((response) => {
            console.log(response)
            this.message = 'Wrong email or password';
            this.alert = true;
            this.loading = false
          });
        }
      }
    },
    computed: {
    ...mapState({
      authLoading: state => state.auth.status === 'loading',
    })
  },
  }
</script>