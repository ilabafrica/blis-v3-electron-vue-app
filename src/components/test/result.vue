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
          <v-toolbar-title>Enter Results</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="close">
            Cancel
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form ref="form" v-model="valid" lazy-validation>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout v-if="savedResults.length > 0" wrap>
              <v-flex
              v-for="result in savedResults"
              :key="result.measure.id"
              xs12 sm12 md12>
                <v-text-field
                  v-if="result.measure.measure_type.code === 'numeric'"
                  v-model="inputs[result.measure.id]"
                  v-on:change="onChange(result.measure.id,'numeric')"
                  :label="result.measure.name">
                </v-text-field>
                <v-text-field
                  v-if="result.measure.measure_type.code === 'free_text'"
                  v-model="inputs[result.measure.id]"
                  v-on:change="onChange(result.measure.id,'free_text')"
                  :label="result.measure.name">
                </v-text-field>
                <v-select
                  v-if="result.measure.measure_type.code === 'alphanumeric'"
                  :items="result.measure.measure_ranges"
                  v-model="inputs[result.measure.id]"
                  item-text="display"
                  item-value="id"
                  v-on:change="onChange(result.measure.id,'alphanumeric')"
                  :label="result.measure.name"
                  >
                </v-select>
              </v-flex>
              <v-flex xs3 offset-xs9 text-xs-right>
                <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save" :loading="loading">
                  Save <v-icon right dark>cloud_upload</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
            <v-layout v-else wrap>
              <v-flex
              v-for="measure in measures"
              :key="measure.id"
              xs12 sm12 md12>
                <v-text-field
                  v-if="measure.measure_type.code === 'numeric'"
                  v-model="inputs[measure.id]"
                  v-on:change="onChange(measure.id,'numeric')"
                  :label="measure.name">
                </v-text-field>
                <v-text-field
                  v-if="measure.measure_type.code === 'free_text'"
                  v-model="inputs[measure.id]"
                  v-on:change="onChange(measure.id,'free_text')"
                  :label="measure.name">
                </v-text-field>
                <v-select
                  v-if="measure.measure_type.code === 'alphanumeric'"
                  :items="measure.measure_ranges"
                  v-model="inputs[measure.id]"
                  item-text="display"
                  item-value="id"
                  v-on:change="onChange(measure.id,'alphanumeric')"
                  :label="measure.name"
                  >
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
  import { EventBus } from './../../main.js'
  import apiCall from '../../utils/api'
  export default {
    data: () => ({
      loading: false,
      message:'',
      y: 'top',
      color: 'success',
      snackbar: false,
      dialog: false,
      valid: true,
      saving: false,
      measures: [],
      savedResults: [],
      results: {
        test_id: '',
        measures: {}
      },
      inputs: [],
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      modal(measure) {
        this.editResults(measure)
      },

      close () {
        this.dialog = false
      },

      editResults (item) {
      console.log(item)
        if (item.results.length > 0) {
          console.log('edit results d',item.results.length)
          this.savedResults = item.results;
          // set old input
          for (var i = this.savedResults.length - 1; i >= 0; i--){

            if (this.savedResults[i].measure.measure_type.code == 'numeric') {
              this.inputs[this.savedResults[i].measure.id] = this.savedResults[i].result;
              this.onChange(this.savedResults[i].measure.id, 'numeric')

            }else if (this.savedResults[i].measure.measure_type.code == 'free_text') {
              this.inputs[this.savedResults[i].measure.id] = this.savedResults[i].result;
              this.onChange(this.savedResults[i].measure.id, 'free_text')

            }else if (this.savedResults[i].measure.measure_type.code == 'alphanumeric') {
              this.inputs[this.savedResults[i].measure.id] = this.savedResults[i].measure_range_id;
              this.onChange(this.savedResults[i].measure.id, 'alphanumeric')
            }
          }

        }else{
          console.log('create results')
          this.measures = item.test_type.measures
        }
        console.log("Measures should be ",this.measures)
        this.results.test_id = item.id;
        this.dialog = true
      },

      onChange (measure_id, measureType) {
         this.$nextTick(() => {
           this.results.measures[measure_id] = {
             measure_range_id: ((measureType == 'alphanumeric') ? this.inputs[measure_id] : null),
             result: ((measureType == 'numeric' || measureType == 'free_text') ? this.inputs[measure_id] : null)
           };
         });
       },

      save () {
        this.loading = true
        apiCall({url: '/api/result', data: this.results, method: 'POST' })
          .then(resp => {
            console.log('resp')
            console.log(resp)

            EventBus.$emit('update-test-list', resp);

            this.inputs = [];
            this.loading = false
            this.dialog = false;
            this.message = 'Results Recorded Succesfully';
            this.snackbar = true;
        })
          .catch(error => {
            this.loading = false
            console.log(error.response)
        })
      }
    }
  }
</script>
