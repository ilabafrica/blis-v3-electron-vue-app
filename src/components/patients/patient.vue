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
    <testrequest ref="testRequestForm"></testrequest>
    <v-dialog v-model="dialog" max-width="500px">
      <v-btn
        outline
        small
        color="primary"
        slot="activator"
        flat>
        New Patient
        <v-icon right dark>playlist_add</v-icon>
      </v-btn>
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
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
                <v-text-field
                  v-model="editedItem.identifier"
                  :rules="[v => !!v  || 'Patient No. is Required']"
                  label="Patient No.">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field v-if="editedIndex > -1"
                  v-model="editedItem.name.given"
                  :rules="[v => !!v || 'Given Name is Required']"
                  label="Given Name">
                </v-text-field>
                <v-text-field v-if="editedIndex === -1"
                  v-model="editedItem.given"
                  :rules="[v => !!v || 'Given Name is Required',
                  v => /^[a-zA-Z]+$/.test(v)  || 'Name should have alphabetic chars only']"
                  label="Given Name">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field v-if="editedIndex > -1"
                  v-model="editedItem.name.family"
                  :rules="[v => !!v || 'Family Name is Required']"
                  label="Family Name">
                </v-text-field>
                <v-text-field v-if="editedIndex === -1"
                  v-model="editedItem.family"
                  :rules="[v => !!v || 'Family Name is Required',,
                  v => /^[a-zA-Z]+$/.test(v)  || 'Family Name should have alphabetic chars only']"
                  label="Family Name">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                Gender
                <v-radio-group v-if="editedIndex > -1"
                  v-model="editedItem.gender_id" row
                  >
                  <v-radio label="Male" :value="1"></v-radio>
                  <v-radio label="Female" :value="2"></v-radio>
                </v-radio-group>
                <v-radio-group v-if="editedIndex === -1"
                  v-model="editedItem.gender_id" row
                  >
                  <v-radio label="Male" value="1"></v-radio>
                  <v-radio label="Female" value="2"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                  readonly
                  v-model="editedItem.birth_date"
                  :rules="[v => !!v || 'Date of Birth is Required']"
                  label="Date of Birth"
                  @click="showCalendar()">
                </v-text-field>
                <v-date-picker v-show="calendar" v-model="editedItem.birth_date" :landscape="landscape" :reactive="reactive"></v-date-picker>
              </v-flex>
              <v-flex xs3 offset-xs9 text-xs-right>
                <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
                  Save <v-icon right dark>cloud_upload</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
        </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-card-title>
      Patients
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        v-on:keyup.enter="initialize"
        hide-details>
      </v-text-field>
    </v-card-title>
    <v-layout row wrap>
    <v-flex md4  v-for="patient in patient" :key="patient.id">
      <div class="blis_patient_card">
        <div class="blis_patient_card_top_button">
          <v-btn outline round small title="View Patient History" color="green" v-if="$can('view_reports')" :to="{name:'patient_reports_single', params:{id:patient.id}}">
            <v-icon dark>list_alt</v-icon>
          </v-btn>
        </div>
        <p class="blis_patient_card_main_heading">{{ patient.name.given }} {{ patient.name.family }}</p>
        <p class="blis_patient_card_small_text">{{ patient.gender.display }}</p>
        <p class="blis_patient_card_title">Identifier</p>
        <p class="blis_patient_card_description">{{ patient.identifier }}</p>
        <p class="blis_patient_card_title">Date of Birth</p>
        <p class="blis_patient_card_description">{{patient.birth_date}}</p>
        <p class="blis_patient_card_title"></p>
        <p class="blis_patient_card_description"></p>
        <p class="blis_patient_card_title"></p>
        <p class="blis_patient_card_description"></p>
        <div class="blis_patient_card_footer">
          <v-btn class="blis_patient_card_button" small title="Edit" color="secondary" round v-if="$can('request_test')" @click="requestTest(patient)">
            <v-icon left dark>add_circle</v-icon>
            New Test
          </v-btn>
          <div class="blis_patient_card_footer_right">
            <v-btn outline fab title="Edit" color="info" small v-if="$can('manage_patients')" @click="editItem(patient)">
              <v-icon dark>edit</v-icon>
            </v-btn>
            <v-btn outline fab title="Edit" color="warn" small v-if="$can('manage_patients')" @click="deleteItem(patient)">
              <v-icon dark>delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-flex>
    </v-layout>
    <div class="text-xs-center">
      <v-pagination
        :length="length"
        :total-visible="pagination.visible"
        v-model="pagination.page"
        @input="initialize"
        circle>
      </v-pagination>
    </div>
  </div>
</template>
<style>
  .blis_patient_card{
    background:white;
    border-right:6px solid green;
    width: 90%;
    margin:5%;
    height: 280px;
    border-radius: 20px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding:20px;
    position: relative;
  }
  .blis_patient_card_top_button{
    position: absolute !important;
    top:5px;
    right:10px;
  }
  .blis_patient_card_main_heading{
    font-size: 24px;
    margin:0px;
  }
  .blis_patient_card_small_text{
    font-size: 14px;
  }
  .blis_patient_card_title{
    font-size: 13px;
    margin:2px;
    color: #AFAFAF;
  }
  .blis_patient_card_description{
    font-size: 13px;
    color: #737373;
  }
  .blis_patient_card_button{
    margin: 0px !important;
    padding: 5px 20px 5px 5px !important;
    width: auto;
    height: auto !important;
  }
  .blis_patient_card_button .v-btn__content{
    text-transform: capitalize;
    font-weight: 400;
  }
  .blis_patient_card_footer{
    position: absolute;
    bottom:0px;
    width:100%;
    padding-bottom: 20px;
  }
  .blis_patient_card_footer_right{
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
  .blis_patient_card_footer_right button{
    margin-bottom: 0px;
  }
</style>

<script>
  import apiCall from '../../utils/api'
  import testrequest from './testrequest'
  import { EventBus } from './../../main.js'

  export default {
    name:'Patient',
    components: {
      testrequest,
    },
    data: () => ({

      message:'',
      y: 'top',
      color: 'success',
      calendar: false,
      message: '',
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
      landscape: true,
      reactive: true,
      search: '',
      query: '',
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Patient No.', value: 'patientno' },
        { text: 'Name', value: 'name' },
        { text: 'Gender', value: 'gender' },
        { text: 'Date of Birth', value: 'birth_date' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      patient: [],
      editedIndex: -1,
      editedItem: {
        identifier: '',
        name: '',
        gender_id: '',
        birth_date: '',

      },
      defaultItem: {
        identifier: '',
        name: '',
        gender_id: '',
        birth_date: '',

      }
    }),
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Patient' : 'Edit Patient Details'
      },
      length: function() {
        return Math.ceil(this.pagination.total / this.pagination.per_page);
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
    mounted() {
      // Listen for the update-patient-list event and its payload.
      EventBus.$on('update-patient-list', data => {
        console.log('update-patient-list')
        Object.assign(this.tests[this.editedIndex], data)
      });
    },

    methods: {
      initialize () {
        this.query = 'page='+ this.pagination.page;
        if (this.search != '') {
            this.query = this.query+'&search='+this.search;
        }
        apiCall({url: '/api/patient?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.patient = resp.data;
          this.pagination.total = resp.total;
          this.pagination.per_page = resp.per_page;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      showCalendar(){
        this.calendar = true
      },
      editItem (item) {
        this.editedIndex = this.patient.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        confirm('Are you sure you want to delete this item?') && (this.delete = true)
        if (this.delete) {
          const index = this.patient.indexOf(item)
          this.patient.splice(index, 1)
          apiCall({url: '/api/patient/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp)
          })
          .catch(error => {
            console.log(error.response)
          })
        }
      },
      close () {
        this.dialog = false
        // if not saving reset dialog references to datatables
        if (!this.saving) {
          this.resetDialogReferences();
        }
      },
      resetDialogReferences() {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.calendar = false
      },
      requestTest (patient) {
        this.$refs.testRequestForm.modal(patient);
      },
      save () {
        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          apiCall({url: '/api/patient/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
          .then(resp => {
            Object.assign(this.patient[this.editedIndex], this.editedItem)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
             this.message = 'Patient Information Updated Succesfully';
            this.snackbar = true;
          })
          .catch(error => {
            console.log(error.response)
          })
        // store
        } else {
          apiCall({url: '/api/patient', data: this.editedItem, method: 'POST' })
          .then(resp => {
            this.patient.push(this.editedItem)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
            this.message = 'Patient Added Succesfully';
            this.snackbar = true;
          })
          .catch(error => {
            console.log(error.response)
          })
        }
        this.close()
      }
    }
  }
</script>