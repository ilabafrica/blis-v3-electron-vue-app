import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  theme: {
    primary: '#2F0074',
    primaryb: '#11002A',
    secondary: '#0E402D',
    accent: '#2F0074',
    error: '#A52422',
    info: '#094074',
    success: '#09B22F',
    warning: '#F18F01'
  },
  customProperties: true,
  iconfont: 'md',
})
