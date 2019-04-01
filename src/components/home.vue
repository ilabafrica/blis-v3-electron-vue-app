<template>
  <div v-if='isAuthenticated && isProfileLoaded'>
<div>
    <v-layout>
        <v-flex  sm6
        xs12
        md6
        lg3 style="padding:10px;">
        <v-card 
      class="mx-auto"
      color="#ff1000"
      dark
      max-width="400"
      height='100%'
        >
        
        <v-icon  style="font-size: 100px;">group</v-icon>
          </v-card-actions>
            <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">Total Patients Registered Today</h3>
             
            </div>
          </v-card-title>
              <v-card-title primary-title>
            <div>
              <div> <h3 class="headline mb-0">{{patient_count}}</h3></div>
             
            </div>
          </v-card-title>

                    <v-card-actions>
        <v-btn to="/patients/patient" flat color="white">View More</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>


      <v-flex  sm6
        xs12
        md6
        lg3 style="padding:10px;">
        <v-card 
      class="mx-auto"
      color="#176ae8"
      dark
      max-width="400"
      height='100%'
    >
        
        <v-icon  style="font-size: 100px;">pages</v-icon>
          </v-card-actions>
            <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">Collected Specimen Today</h3>
           
            </div>
          </v-card-title>
              <v-card-title primary-title>
            <div>
              <div> <h3 class="headline mb-0">{{specimen_count}}</h3></div>
             
            </div>
          </v-card-title>
                    <v-card-actions>
          <v-btn to="/test/index" flat color="white">View More</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      
         <v-flex  sm6
        xs12
        md6
        lg3 style="padding:10px;">
      <v-card 
      class="mx-auto"
      color="#ff9000"
      dark
      max-width="400"
      height='100%'
    >
            <v-icon  style="font-size: 100px;">done_all</v-icon>
  
          <v-card-title primary-title>
          
            <div>
              <h3 class="headline mb-0">Total Tests Done Today</h3>
     
            </div>
          </v-card-title>
              <v-card-title primary-title>
            <div>
              <div> <h3 class="headline mb-0">{{test_count}}</h3></div>
             
            </div>
          </v-card-title>
  
          <v-card-actions>
            <h3 class="headline mb-0"></h3>
              <v-btn to="/test/index" flat color="white">View More</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

       <v-flex  sm6
        xs12
        md6
        lg3 style="padding:10px;">
      <v-card 
      class="mx-auto"
      color="#11680c"
      dark
      max-width="400"
        sub-icon="check_box"
      height='100%'
       >
            <v-icon  style="font-size: 100px;">check_box</v-icon>
  
          <v-card-title primary-title>
          
            <div>
              <h3 class="headline mb-0">Completed Tests Today</h3>
            
            </div>
        
          </v-card-title>
      <v-card-title primary-title>
            <div>
              <div> <h3 class="headline mb-0">{{test_complete}}</h3></div>
             
            </div>
          </v-card-title>
          <v-card-actions>
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