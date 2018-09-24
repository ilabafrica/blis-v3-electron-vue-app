import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  theme: {
    primary: '#1976d2',
    secondary: '#13293D',
    accent: '#009FFD',
    error: '#F37748',
    info: '#17183B',
    success: '#4CAF50',
    warning: '#F18805'
  },
  customProperties: true,
  iconfont: 'md',
})
