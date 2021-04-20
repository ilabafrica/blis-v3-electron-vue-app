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
                      :rules="[v => !!v || 'Specimen Type is Required']"
                      v-on:change="onChange"
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
                  <v-flex xs12 sm12 md12>
                    Tests
                  </v-flex>
                  <v-flex
                    xs12 sm12 md12
                    v-for="test in tests"
                    :key="test.id">
                    <v-checkbox
                      v-model="specimenCollection.testIds"
                      v-if="isSpecimenCompartible(test)"
                      :label="test.test_type.name"
                      :value="test.id"> 
                    </v-checkbox>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save" :loading="loading">
                Save <v-icon right dark>cloud_upload</v-icon>
              </v-btn>
            </v-card-actions>
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
      loading: false,
      landscape: true,
      reactive: true,
      valid: true,
      dialog: false,
      saving: false,
      specimenTypes: [],
      testTypes: [],
      encounter: {},
      tests: {},
      message:'',
      y: 'top',
      color: 'success',
      snackbar: false,
      specimenCollection: {
        encounter_id: '',
        specimen_type_id: '',
        time_collected: '',
        collected_by: '',
        time_received: '',
        testIds: [],
      }
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
    },

    methods: {

      initialize () {

        apiCall({url: '/api/specimentype?all=true', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.specimenTypes = resp;
        })
        .catch(error => {
          console.log(error.response)
        })

      },

      onChange: function (){
        var self = this
           apiCall({url: '/api/specimentype/specimencollection/'+self.specimenCollection.specimen_type_id, method: 'GET' })
            .then(function (response) {
              console.log('response')
              console.log(response)
              self.testTypes = response[0].test_types
              console.log(self.testTypes)
            })
            .catch(function (error) {
              console.log(error);
            });    
      },

      isSpecimenCompartible (test) {
        let boolean = false;
          for (var i = test.test_type.specimen_types.length - 1; i >= 0; i--) {
            if (test.test_type.specimen_types[i].id == this.specimenCollection.specimen_type_id) {
              boolean = true
            }
          }
        return boolean;
      },

      modal (encounter) {
        this.tests = encounter.tests;
        this.encounter = encounter;
        this.specimenCollection.encounter_id = encounter.id;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },

      save () {
        if(this.$refs.form.validate()){
          this.loading = true
          this.saving = true;

          apiCall({url: '/api/encounter/specimencollection', data: this.specimenCollection, method: 'POST' })
          .then(resp => {
            console.log(resp)
            EventBus.$emit('update-encounter-list', resp);
            this.message = 'Specimen Collected';
            this.snackbar = true;
            this.saving = false;
            this.loading = false
          })
          .catch(error => {
            this.loading = false
            console.log(error.response)
          })
          this.close()
        }
      }
    }
  }
</script>
