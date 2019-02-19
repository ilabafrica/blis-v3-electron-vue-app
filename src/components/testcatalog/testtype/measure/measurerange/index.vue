<template>
  <div>
    <v-dialog v-model="dialogNumericRange" max-width="500px">
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Numeric Range Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="close">
            Cancel
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form ref="form" v-model="valid" lazy-validation>
        <v-card-text>
            <v-flex xs12 sm12 d-flex>
            <v-select
              v-model="numerics.age_range"
              :items="age_range"
              label="Age Range"
            ></v-select>
          </v-flex>
          <v-flex xs12 sm12 md12>
            <v-text-field
              v-model="numerics.age_min"
              :rules="[v => !!v || 'Lower age limit is Required']"
              label="Lower Age Limit">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm12 md12>
            <v-text-field
              v-model="numerics.age_max"
              :rules="[v => !!v || 'Upper age limit is Required']"
              label="Upper Age Limit">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm12 d-flex>
            <v-select
              v-model="numerics.gender_id"
              :items="gender"
              label="Gender"
              item-text="display"
              item-value="id"
            ></v-select>
          </v-flex>
          <v-flex xs12 sm12 md12>
            <v-text-field
              v-model="numerics.low"
              :rules="[v => !!v || 'Lower Measure limit is Required']"
              label="Lower Measure Range">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm12 md12>
            <v-text-field
              v-model="numerics.high"
              :rules="[v => !!v || 'Upper Measure limit is Required']"
              label="Upper Measure Range">
            </v-text-field>
          </v-flex>
          <v-flex xs3 offset-xs9 text-xs-right>
            <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="saveMeasureRange" :loading="loading">
              Save <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
          </v-flex>
        </v-card-text>
      </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogAlphanumericRange" max-width="500px">
      <v-card>
        <v-card-title>
          Range Details
        </v-card-title>
        <v-form ref="form" v-model="valid" lazy-validation>
        <v-card-text>
          <v-flex xs12 sm12 md12>
            <v-text-field
              v-model="alphanumerics.display"
              :rules="[v => !!v || 'Value is Required']"
              label="Value">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm12 d-flex>
            <v-select
              v-model="alphanumerics.interpretation_id"
              :items="interpretation"
              label="Interpretation"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-flex>
        </v-card-text>
      </v-form>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="closeAlphaMeasureRangeDialog">Close</v-btn>
          <v-btn color="blue darken-1" :disabled="!valid" flat @click.native="saveMeasureRange" :loading="loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card-title>
      {{measure.name}}
    </v-card-title>
    <!-- list of measure ranges -->
    <div v-if="measure.measure_type">
      <v-btn
        v-if="measure.measure_type.code === 'numeric'"
        
        color="info" dark @click="dialogNumericRange = !dialogNumericRange">
        Add New Range
      </v-btn>
      <v-btn
        v-if="measure.measure_type.code != 'numeric'"
        color="info" dark @click="dialogAlphanumericRange = !dialogAlphanumericRange">
        Add New Range
      </v-btn>
      <v-data-table
        v-if="measure.measure_type.code === 'numeric'"
        :headers="rangeheaders"
        :items="measure.measure_ranges"
        hide-actions >
        <template slot="items" slot-scope="row">
          <tr :key="row.item.id">
            <td>{{row.item.age_min}}</td>
            <td>{{row.item.age_max}}</td>
            <td>{{row.item.gender.display}}</td>
            <td>{{row.item.low}}</td>
            <td>{{row.item.high}}</td>
            <td class="justify-left layout px-0">
              <v-btn
                outline
                small
                flat
                title="Edit"
                v-if="$can('manage_test_catalog')"
                color="teal"
                @click="editItem(row.item)">
                Edit
                <v-icon right dark>edit</v-icon>
              </v-btn>
              <v-btn
                outline
                small
                flat
                title="Delete"
                v-if="$can('manage_test_catalog')"
                color="pink"
                @click="deleteItem(row.item)">
                Delete
                <v-icon right dark>delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-data-table
        v-if="measure.measure_type.code != 'numeric'"
        :headers="alpharangeheaders"
        :items="measure.measure_ranges"
        hide-actions>
        <template slot="items" slot-scope="row">
          <tr :key="row.item.id">
            <td>{{row.item.display}}</td>
            <td v-if="row.item.interpretation">{{row.item.interpretation.name}}</td>
            <td v-else></td>
            <td class="justify-left layout px-0">
              <v-btn
                outline
                small
                flat
                title="Edit"
                v-if="$can('manage_test_catalog')"
                color="teal"
                @click="editItem(row.item)">
                Edit
                <v-icon right dark>edit</v-icon>
              </v-btn>
              <v-btn
                outline
                small
                title="Break Points"
                v-if="$can('manage_test_catalog') && measure.test_type.culture == 1"
                color="red"
                :to="{path:'/testcatalog/testtype/'+measure.test_type_id+'/measure/'+row.item.measure_id+'/measurerange/'+row.item.id+'/breakpoint'}"
                flat>
                Break Points
                <v-icon right dark>bug_report</v-icon>
              </v-btn>
              <v-btn
                outline
                small
                flat
                title="Break Points"
                v-if="$can('manage_test_catalog')"
                color="pink"
                @click="deleteItem(row.item)">
                Delete
                <v-icon right dark>delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script>
  import apiCall from '../../../../../utils/api'
  import Vue from 'vue'
  export default {
    name: 'MeasureRange',
    data: () => ({
      loading: false,
      dialog: false,
      dialogNumericRange: false,
      dialogAlphanumericRange: false,
      valid: true,
      delete: false,
      measure: {},
      numerics:{
        measure_id: '',
        age_range: '',
        age_min: '',
        age_max: '',
        gender_id: '',
        low: '',
        high: '',
      },

      editedIndex: -1,

      defaultNumerics:{
        measure_id: '',
        age_range: '',
        age_min: '',
        age_max: '',
        gender_id: '',
        low: '',
        high: '',
      },

      alphanumerics:{
        measure_id: '',
        display: '',
        interpretation_id: '',
      },

      defaultAlphaNumerics:{
        measure_id: '',
        display: '',
        interpretation_id: '',
      },

      age_range: ['Years', 'Months', 'Days'],
      gender: [],
      interpretation: [],
      measureRanges: [],
      testType: {},
      measures: [],
      items: [],
      
      rangeheaders: [
        { text: 'Minimum Age (Years)', value: 'age_min' },
        { text: 'Maximum Age (Years)', value: 'age_max' },
        { text: 'Gender', value: 'gender_id' },
        { text: 'Lower limit', value: 'low' },
        { text: 'Higher limit', value: 'high' },
        { text: 'Actions', value: 'name', sortable: false },
      ],
      alpharangeheaders: [
        { text: 'Display', value: 'display' },
        { text: 'Interpretation', value: 'interpretation_id' },
        { text: 'Actions', value: 'name', sortable: false },
      ],
      measureheaders: [
        { text: 'Name', value: 'name' },
        { text: 'Unit', value: 'unit' },
        { text: 'Actions', value: 'name', sortable: false },
      ]
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
    },

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

        apiCall({url: '/api/measure/'+this.$route.params.measureId, method: 'GET' })
          .then(resp => {
            console.log(resp)
            this.measure = resp;
            this.measureRanges = measure.measure_ranges;

          })
          .catch(error => {
            console.log(error.response)
        })

        apiCall({url: '/api/gender', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.gender = resp;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/api/interpretation', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.interpretation = resp;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/api/measuretype', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.measureTypes = resp;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      closeMainDialog () {
        this.dialog = false
      },

      closeMeasureRangeDialog () {
        this.dialogNumericRange=false
        this.updatingMeasureRange=false
        this.resetMeasureRangeDialogReferences();

      },

      closeAlphaMeasureRangeDialog () {
        this.dialogAlphanumericRange=false
        this.updatingMeasureRange=false
        this.resetAlphaMeasureRangeDialogReferences();

      },

      resetMeasureRangeDialogReferences () {
        this.numerics = Object.assign({}, this.defaultNumerics)
      },

      resetAlphaMeasureRangeDialogReferences () {
        this.alphanumerics = Object.assign({}, this.defaultAlphaNumerics)
      },

      saveMeasureRange(){

        this.saving = true;
        // update
        if (this.editedIndex > -1) {
            if(this.measure.measure_type.code === 'numeric'){
              if(this.$refs.form.validate()){
                this.loading = true
                apiCall({url: '/api/measurerange/'+this.numerics.id, data: this.numerics, method: 'PUT' })
                .then(resp => {
                  Object.assign(this.item[this.editedIndex], this.numerics)
                  console.log("Numeric Measure type save response",resp)
                  this.loading = false
                })
                .catch(error => {
                  this.loading = false
                  console.log(error.response)
                })
                this.closeMeasureRangeDialog();
                this.saving = false;
              }
            }else{
              if(this.$refs.form.validate()){
                this.loading = true
                apiCall({url: '/api/measurerange/'+this.alphanumerics.id, data: this.alphanumerics, method: 'PUT' })
                .then(resp => {
                  Object.assign(this.item[this.editedIndex], this.alphanumerics)
                  console.log("Alphanumeric measure type save response is ",resp)
                  this.loading = false
                })
                .catch(error => {
                  this.loading = false
                  console.log(error.response)
                })
                this.closeAlphaMeasureRangeDialog();
                this.saving = false;
              }
            }

        //store
        }else{
            if(this.measure.measure_type.code === 'numeric'){
              if(this.$refs.form.validate()){
                this.loading = true
                this.numerics.measure_id = this.$route.params.measureId
                apiCall({url: '/api/measurerange', data: this.numerics, method: 'POST' })
                .then(resp => {
                  console.log('numerics', resp);
                  let measureRanges = this.measure.measure_ranges
                  measureRanges.push(resp)
                  Vue.set(this.measure,"measure_ranges",measureRanges)
                  this.loading = false
                  console.log(this.numerics);
                })
                .catch(error => {
                  this.loading = false
                  console.log(error.response)
                })
                this.closeMeasureRangeDialog();
              }
            }else{
              if(this.$refs.form.validate()){
                this.loading = true
                this.alphanumerics.measure_id = this.$route.params.measureId
                console.log("alphanumerics")
                console.log(this.alphanumerics)
                apiCall({url: '/api/measurerange', data: this.alphanumerics, method: 'POST' })
                .then(resp => {
                  console.log('alphanumerics ', resp);
                  let measureRanges = this.measure.measure_ranges
                  measureRanges.push(resp)
                  Vue.set(this.measure,"measure_ranges",measureRanges)
                  this.loading = false
                  console.log(this.alphanumerics);
                })
                .catch(error => {
                  this.loading = false
                  console.log(error.response)
                })
                this.closeAlphaMeasureRangeDialog();
              }
            }
        }
      },

      editItem (item) {
        if(this.measure.measure_type.code != 'numeric'){
          console.log("item" + item)
          this.editedIndex = 2
          this.alphanumerics = Object.assign({}, item)
          this.dialogAlphanumericRange = true
        }else{
          console.log("item" + item)
          this.editedIndex = 2
          this.numerics = Object.assign({}, item)
          this.dialogNumericRange = true
        }
      },
    }
  }
</script>