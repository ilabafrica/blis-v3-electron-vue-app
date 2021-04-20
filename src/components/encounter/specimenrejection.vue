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
          <v-toolbar-title>Reject Specimen</v-toolbar-title>
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
                      :items="specimenTypes"
                      v-model="specimenRejection.specimen_type_id"
                      item-text="name"
                      item-value="id"
                      label="Specimen Type">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-menu>
                      <v-text-field :rules="[v => !!v || 'Time Collected is Required']" :value="specimenRejection.time_collected" slot="activator" label="Time Collected"></v-text-field>
                      <v-date-picker v-model="specimenRejection.time_collected"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-menu>
                      <v-text-field :rules="[v => !!v || 'Time Received is Required']" :value="specimenRejection.time_received" slot="activator" label="Time Received"></v-text-field>
                      <v-date-picker v-model="specimenRejection.time_received"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field
                      v-model="specimenRejection.collected_by"
                      :rules="[v => !!v || 'Collected by is Required']"
                      label="Collected by">
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-autocomplete
                      v-bind:items="rejectionReasons"
                      v-model="specimenRejection.rejection_reason_ids"
                      label="Rejecion Reasons"
                      item-text="display"
                      item-value="id"
                      multiple chips>
                    </v-autocomplete>
                  </v-flex>
                  <v-flex xs3 offset-xs9 text-xs-right>
                    <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
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
  import { EventBus } from './../../main.js'
  import apiCall from '../../utils/api'
  export default {
    data: () => ({
      calendar: false,
      message:'',
      y: 'top',
      color: 'success',
      snackbar: false,
      landscape: true,
      reactive: true,
      valid: true,
      dialog: false,
      saving: false,
      specimenTypes: [],
      specimenRejection: {
        specimen_type_id: '',
        time_collected: '',
        collected_by: '',
        time_received: '',
        encounter_id: '',
        rejection_reason_ids: [],
      },
      rejectionReasons: [],
      test: {}
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      initialize () {
        apiCall({url: '/api/rejectionreason', method: 'GET' })
          .then(resp => {
            this.rejectionReasons = resp;
            console.log(resp)
        }).catch(error => {
            console.log(error.response)
        })
        apiCall({url: '/api/specimentype?all=true', method: 'GET' })
          .then(resp => {
            this.specimenTypes = resp;
            console.log(resp)
        }).catch(error => {
            console.log(error.response)
        })
      },

      modal (encouter) {
        this.initialize()
        this.specimenRejection.encouter_id = encouter.id;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },

      save () {
          console.log('this.specimenRejection')
          console.log(this.specimenRejection)
          apiCall({url: '/api/specimenrejection', data: this.specimenRejection, method: 'POST' })
          .then(resp => {
            console.log(resp)
            EventBus.$emit('update-test-list', resp);
            this.message = 'Specimen Rejected';
            this.snackbar = true;
          })
          .catch(error => {
            console.log(error.response)
          })
        this.close()

      }
    }
  }
</script>
