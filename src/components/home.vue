<template>
  <div v-if='isAuthenticated && isProfileLoaded'>
<div>




 <v-layout wrap>
   
  <v-flex  sm6
      xs12
      md6
      lg3 style="padding:10px;">
      <v-card color="blue-grey darken-2" class="white--text">
        <v-layout>
          <v-flex xs5>
            <v-img
            src="https://image.flaticon.com/icons/svg/33/33308.svg"
            height="125px"
            contain
            ></v-img>
          </v-flex>
       
<v-flex xs7>
  <v-card-title primary-title>
    <div>
      <div class="headline">Patients Registered Today</div>
      <div class="title ml-2 mt-2">{{patient_count}}</div>
      <div></div>
    </div>
  </v-card-title>
</v-flex>
</v-layout>
<v-divider light></v-divider>
<v-card-actions class="pa-3">
 <v-btn to="/patients/patient" flat color="white">View More</v-btn>
</v-card-actions>
</v-card>
</v-flex>

<v-flex  sm6
xs12
md6
lg3 style="padding:10px;">
<v-card color="cyan darken-2" class="white--text">
  <v-layout>
    <v-flex xs5>
      <v-img
      src="test-tube.png"
      height="125px"
      contain
      ></v-img>
    </v-flex>
    <v-flex xs7>
      <v-card-title primary-title>
        <div>
          <div class="headline">Specimen Collected Today</div>
          <div class="headline">{{specimen_count}}</div>
          <div></div>
        </div>
      </v-card-title>
    </v-flex>
  </v-layout>
  <v-divider light></v-divider>
  <v-card-actions class="pa-3">
   <v-btn to="/test/index" flat color="white">View More</v-btn>
 </v-card-actions>
</v-card>
</v-flex>
<v-flex  sm6
xs12
md6
lg3 style="padding:10px;">
<v-card color=" red darken-4" class="white--text">
  <v-layout>
    <v-flex xs5>
      <v-img
      src="alltests.png"
      height="125px"
      contain
      ></v-img>
    </v-flex>
    <v-flex xs7>
      <v-card-title primary-title>
        <div>
          <div class="headline">Total Tests Done Today</div>
          <div class="headline">{{test_count}}</div>

        </div>
      </v-card-title>
    </v-flex>
  </v-layout>
  <v-divider light></v-divider>
  <v-card-actions class="pa-3">
   <v-btn to="/test/index" flat color="white">View More</v-btn>
 </v-card-actions>
</v-card>
</v-flex>
<v-flex  sm6
xs12
md6
lg3 style="padding:10px;">
<v-card color="green" class="white--text">
  <v-layout row>
    <v-flex xs7>
      <v-card-title primary-title>
        <div>
          <div class="headline">Completed Tests Today</div>
          <div class="headline">{{test_complete}}</div>

        </div>
      </v-card-title>
    </v-flex>
    <v-flex xs5>
      <v-img
      src="blood-sample.png"
      height="125px"
      contain
      ></v-img>
    </v-flex>
  </v-layout>
  <v-divider light></v-divider>
  <v-card-actions class="pa-3">
    <v-btn to="/test/index" flat color="white">View More</v-btn>

  </v-card-actions>
</v-card>
</v-flex>


</v-layout>




   
  </div>
    </div>
</template>

<script>
  import apiCall from '../utils/api'
  import { mapGetters, mapState } from 'vuex'

  export default {
    name:'Home',
    computed: {
      ...mapGetters(['isAuthenticated', 'isProfileLoaded']),
    },
      data: () => ({
          test_count: '',
          test_complete:'',
          patient_count:'',
          specimen_count:'',
      }),

      created () {
          this.initialize()
      },

      methods: {
          initialize () {
              apiCall({url: '/api/testscount', method: 'GET' })
            .then(resp => {
              console.log(resp)
              this.test_count = resp;
            })
            .catch(error => {
              console.log(error.response)
            })
          {
              apiCall({url: '/api/completed', method: 'GET' })
            .then(resp => {
              console.log(resp)
              this.test_complete = resp;
            })
            .catch(error => {
              console.log(error.response)
            })
          }
          {
              apiCall({url: '/api/specimencount', method: 'GET' })
            .then(resp => {
              console.log(resp)
              this.specimen_count = resp;
            })
            .catch(error => {
              console.log(error.response)
            })
          }
            {
              apiCall({url: '/api/patient_count', method: 'GET' })
            .then(resp => {
              console.log(resp)
              this.patient_count = resp;
            })
            .catch(error => {
              console.log(error.response)
            })
          }
        }

      }



}
</script>