<template>
  <div>
    <v-card-title>
      {{testType.name}}
    </v-card-title>
    <v-layout row>
      <v-dialog v-model="dialogMeasure" max-width="500px">
        <v-btn
          outline
          small
          color="primary"
          slot="activator"
          flat>
          New Measure
          <v-icon right dark>playlist_add</v-icon>
        </v-btn>
        <v-card>
          <v-toolbar dark color="primary" class="elevation-0">
            <v-toolbar-title>Measure</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn round outline color="blue lighten-1" flat @click.native="close">
              Cancel
              <v-icon right dark>close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="measurefield.name"
                :rules="[v => !!v || 'Name is Required']"
                label="Name">
              </v-text-field>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-select
                :items="measureTypes"
                v-model="measurefield.measure_type_id"
                item-text="name"
                item-value="id"
                label="Measure "
              ></v-select>
            </v-flex>            
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="measurefield.unit"
                :rules="[v => !!v || 'Unit is Required']"
                label="Unit">
              </v-text-field>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="measurefield.description"
                :rules="[v => !!v || 'Description is Required']"
                label="Description">
              </v-text-field>
            </v-flex>
            <v-flex xs3 offset-xs9 text-xs-right>
              <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="saveMeasure">
                Save <v-icon right dark>cloud_upload</v-icon>
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
      <v-divider></v-divider>
      <v-layout child-flex>
        <v-data-table
          :headers="measureheaders"
          :items="measures"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td class="text-xs-left">{{ props.item.unit }}</td>
            <td class="justify-left layout px-0">
              <v-btn
                outline
                small
                title="Edit"
                color="teal"
                flat
                @click="editMeasure(props.item)">
                Edit
                <v-icon right dark>edit</v-icon>
              </v-btn>
              <v-btn
                outline
                small
                title="Measure Ranges"
                color="info"
                :to="{path:'/testcatalog/testtype/'+props.item.test_type_id+'/measure/'+props.item.id+'/measurerange'}"
                flat>
                Measure Ranges
                <v-icon right dark>tune</v-icon>
              </v-btn>
              <v-btn
                outline
                small
                title="Delete"
                color="pink"
                flat
                @click="deleteMeasure(props.item)">
                Delete
                <v-icon right dark>delete</v-icon>
              </v-btn>
            </td>
          </template>
        </v-data-table>
      </v-layout>
  </div>
</template>
<script>
  import apiCall from '../../../../utils/api'

  export default {
    data: () => ({
      dialog: false,
      dialogMeasure: false,
      dialogNumericRange: false,
      dialogAlphanumericRange: false,
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
      updating: false,
      savingMeasure: false,
      updatingMeasure: false,
      measureType: '',
      RangeID: 0,

      measure: {},

      measurefield: {
        test_type_id: '',
        measure_type_id: '',
        name: '',
        unit: '',
        description: '',
      },

      defaultMeasure: {
        test_type_id: '',
        measure_type_id: '',
        name: '',
        unit: '',
        description: '',
      },

      interpretation: [],
      measureTypes: [],
      measureRanges: [],
      testTypes: [],
      testType: {},
      measures: [],
      
      search: '',
      query: '',
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

      // get earger loaded test type
      apiCall({url: '/api/testtype/'+parseInt(this.$route.params.testTypeId), method: 'GET' })
        .then(resp => {
          console.log('Test Type')
          console.log(resp)
          this.testType = resp;

          this.measures = resp.measures;
        })
        .catch(error => {
          console.log(error.response)
      })

        if (this.search != '') {
            this.query = this.query+'&search='+this.search;
        }

        apiCall({url: '/api/specimentype', method: 'GET' })
          .then(resp => {
            console.log(resp)
            this.specimenTypes = resp.data;
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

        apiCall({url: '/api/testtype?fetch=all', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testTypes = resp;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editMeasure (item) {
        this.updatingMeasure = true
        this.itemIndex = this.measures.indexOf(item)
        this.measurefield = Object.assign({}, item)
        this.dialogMeasure = true
      },

      deleteMeasure (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.measures.indexOf(item)
          this.measures.splice(index, 1)
          apiCall({url: '/api/measure/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp)
          })
          .catch(error => {
            console.log(error.response)
          })
        }
      },

      closeMeasureDialogue () {
        this.dialogMeasure=false
        this.updatingMeasure = false
        this.resetMeasureDialogReferences();
      },

      resetMeasureDialogReferences() {
        this.measurefield = Object.assign({}, this.defaultMeasure)
      },

      updateTestType () {

        apiCall({url: '/api/testtype/'+parseInt(this.$route.params.testTypeId), method: 'GET' })
          .then(resp => {
            console.log('Test Type')
            console.log(resp)
            this.testType = resp;

            this.measures = resp.measures;
          })
          .catch(error => {
            console.log(error.response)
        })
      },

      saveMeasure(){
        this.savingMeasure = true;
        // update
        if (this.updatingMeasure) {

          apiCall({url: '/api/measure/'+this.measurefield.id, data: this.measurefield, method: 'PUT' })
          .then(resp => {
            Object.assign(this.measures[this.itemIndex], this.measurefield)
            console.log(resp)
            this.closeMeasureDialogue();
          })
          .catch(error => {
            console.log(error.response)
          })

        //store
        } else {
        this.measurefield.test_type_id = this.testType.id;

          apiCall({url: '/api/measure', data: this.measurefield, method: 'POST' })
          .then(resp => {
            this.measures.push(this.measurefield)
            console.log('resp')
            console.log(resp)
            
            this.closeMeasureDialogue();
          })
          .catch(error => {
            console.log(error.response)
          })
        }
      },

      saveMeasureRange(){

        if(this.measureType === 'numeric'){
          this.numerics.measure_id = this.measureId
          apiCall({url: '/api/measurerange', data: this.numerics, method: 'POST' })
          .then(resp => {
            this.measureRanges.push(this.numerics)
            console.log('numerics');
            console.log(this.numerics);
          })
          .catch(error => {
            console.log(error.response)
          })
          this.closeMeasureRangeDialog();
        }else{
          this.alphanumerics.measure_id = this.measureId
          apiCall({url: '/api/measurerange', data: this.alphanumerics, method: 'POST' })
          .then(resp => {
            this.measureRanges.push(this.alphanumerics)
            console.log('alphanumerics');
            console.log(this.alphanumerics);
          })
          .catch(error => {
            console.log(error.response)
          })
          this.closeAlphaMeasureRangeDialog();
        }
      }
    }
  }
</script>