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
          <v-toolbar-title>Receive Specimen</v-toolbar-title>
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
                      v-model="specimenCollection.specimen_type_id"
                      item-text="name"
                      item-value="id"
                      label="Specimen Type">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-menu>
                      <v-text-field :rules="[v => !!v || 'Time Collected is Required']" :value="specimenCollection.time_collected" slot="activator" label="Time Collected"></v-text-field>
                      <v-date-picker v-model="specimenCollection.time_collected"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-menu>
                      <v-text-field :rules="[v => !!v || 'Time Received is Required']" :value="specimenCollection.time_received" slot="activator" label="Time Received"></v-text-field>
                      <v-date-picker v-model="specimenCollection.time_received"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field
                      v-model="specimenCollection.collected_by"
                      :rules="[v => !!v || 'Collected by is Required']"
                      label="Collected by">
                    </v-text-field>
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
  import { EventBus } from './../../main.js'
  import apiCall from '../../utils/api'
  export default {
    data: () => ({
      datePicker: {
        time_collected: false,
        time_received: false,
      },
      loading: false,
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
      test: {},
      specimenCollection: {
        test_id: '',
        specimen_type_id: '',
        time_collected: '',
        collected_by: '',
        time_received: '',
      },
      defaultItem: {
        test_id: '',
        specimen_type_id: '',
        time_collected: '',
        collected_by: '',
        time_received: '',
      }
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      modal (test) {
        this.test = test;
        this.specimenTypes = test.test_type.specimen_types;
        this.specimenCollection.test_id = test.id;
        this.dialog = true;
      },

      close () {
        this.dialog = false
        this.resetDialogReferences()
      },

      resetDialogReferences() {
        this.specimenCollection = Object.assign({}, this.defaultItem)
      },

      save () {
        if(this.$refs.form.validate()){
          this.loading = true
          this.saving = true;

          apiCall({url: '/api/test/specimencollection', data: this.specimenCollection, method: 'POST' })
          .then(resp => {
            console.log(resp)
            EventBus.$emit('update-test-list', resp);
            this.saving = false;
            this.loading = false
            this.message = 'Collection Details Recorded Succesfully';
            this.snackbar = true;
          })
          .catch(error => {
            console.log(error.response)
            this.loading = false
          })
          this.close()
        }
      }
    }
  }
</script>
