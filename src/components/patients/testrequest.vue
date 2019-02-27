<template>
  <div>

      <v-snackbar
        v-model="snackbar"
          
        :color="color"
        :timeout="6000"
      :top="y === 'top'"
      >
        {{ message }}
      </v-snackbar>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Test Request</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="close">
            Cancel
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form ref="form" v-model="valid" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm12 md12>
                    <v-select
                      :items="visitTypes"
                      v-model="testRequest.encounter_class_id"
                      item-text="display"
                      item-value="id"
                      :rules="[v => !!v || 'Visit Type is Required']"
                      label="Visit Type"
                      >
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-select
                      :items="locations"
                      v-model="testRequest.location_id"
                      item-text="name"
                      item-value="id"
                      label="Location">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field
                      v-model="testRequest.practitioner_name"
                      :rules="[v => !!v || 'Requesting Physician is Required']"
                      label="Requesting Physician">
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-select
                      v-bind:items="testTypes"
                      v-model="testRequest.testTypeIds"
                      label="Tests"
                      item-text="name"
                      item-value="id"
                      autocomplete multiple chips>
                    </v-select>
                  </v-flex>
                  <v-flex xs3 offset-xs9 text-xs-right>
                    <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save" :loading="loading">
                      Save <v-icon right dark>cloud_upload</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import apiCall from '../../utils/api'
  import { EventBus } from './../../main.js'

  export default {
    data: () => ({
      loading: false,
      message:'',
      y: 'top',
      color: 'success',
      datePicker: false,
      landscape: true,
      reactive: true,
      valid: true,
      dialog: false,
      visitTypes: [],
      testTypes: [],
      locations: [],
      testRequest: {
        patient_id: '',
        bed_no: '',
        location_id: '',
        practitioner_name: '',
        encounter_class_id: '',
        testTypeIds: [],
      },
      defaultItem: {
        patient_id: '',
        bed_no: '',
        location_id: '1',
        practitioner_name: '',
        encounter_class_id: '',
        testTypeIds: [],
      }
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      initialize () {
        apiCall({url: '/api/testtype?fetch=all', method: 'GET' })
          .then(resp => {
            console.log("Test Types are: ",resp)
            this.testTypes = resp;
        }).catch(error => {
            console.log(error.response)
        })

        apiCall({url: '/api/location', method: 'GET' })
          .then(resp => {
            this.locations = resp.data;
            console.log("Locations are: ",resp)
        }).catch(error => {
            console.log(error.response)
        })

        apiCall({url: '/api/encounterclass', method: 'GET' })
          .then(resp => {
            this.visitTypes = resp;
            console.log(resp)
        }).catch(error => {
            console.log(error.response)
        })
      },

      modal (patient) {
        this.initialize();
        this.testRequest.patient_id = patient.id;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },

      resetDialogReferences() {
        this.testRequest = Object.assign({}, this.defaultItem)
      },

      save () {
        if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/patient/testrequest', data: this.testRequest, method: 'POST' })
            .then(resp => {
              this.loading = false
              console.log(resp)
              EventBus.$emit('update-test-list', resp);
              this.message = 'New Test Added  Succesfully';
              this.snackbar = true;
            })
            .catch(error => {
              this.loading = false
              console.log(error.response)
            })
          this.close()
          this.resetDialogReferences()
        }
      }
    }
  }
</script>
