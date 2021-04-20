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
    <v-dialog v-model="loadingDialog.loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ loadingDialog.message }}
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <testrequest ref="testRequestForm"></testrequest>
    <v-dialog v-model="dialog" max-width="500px">
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
                  label="Patient No.">
                </v-text-field>
                <!-- :rules="[v => !!v || 'Patient No. is Required']" -->
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
                  v => /^[a-zA-Z\s]+$/.test(v)  || 'Name should have alphabetic chars only']"
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
                  :rules="[v => !!v || 'Family Name is Required',
                  v => /^[a-zA-Z\s]+$/.test(v)  || 'Family Name should have alphabetic chars only']"
                  label="Family Name">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                Gender
                <v-radio-group v-if="editedIndex > -1"
                  v-model="editedItem.gender_id" row
                  :rules="[v => !!v || 'A radio selection is required']">
                  <v-radio label="Male" :value="1"></v-radio>
                  <v-radio label="Female" :value="2"></v-radio>
                </v-radio-group>
                <v-radio-group v-if="editedIndex === -1"
                  v-model="editedItem.gender_id" row
                  :rules="[v => !!v || 'A radio selection is required']">
                  <v-radio label="Male" :value="1"></v-radio>
                  <v-radio label="Female" :value="2"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-menu>
                  <v-text-field :rules="[v => !!v || 'Date of Birth is Required']" :value="editedItem.birth_date" slot="activator" label="Date of Birth"></v-text-field>
                  <v-date-picker v-model="editedItem.birth_date"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs3 offset-xs9 text-xs-right>
                <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save" :loading="loading">
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
      <p class="blis_page_title">
        Patients
      </p>
      <v-btn small color="primary" class="blis_card_button" @click="newItem">
        <v-icon left dark>add_circle</v-icon>
        New Patient
      </v-btn>
      <v-spacer></v-spacer>
      <v-text-field class="blis_search" v-model="search" append-icon="search" label="Search" single-line v-on:keyup.enter="initialize" hide-details>
      </v-text-field>
    </v-card-title>
    <v-layout row wrap>
    <v-flex sm12 md6 lg4 v-for="patient in patients" :key="patient.id">
      <div class="blis_card">
        <div class="blis_card_top_right">
          <v-btn outline fab small title="View History" color="green" v-if="$can('view_reports')" @click="toPatientHistory(patient)">
            <v-icon dark>description</v-icon>
          </v-btn>
        </div>
        <p class="blis_card_main_heading">{{ patient.name.given }} {{ patient.name.family }}</p>
        <p class="blis_card_small_text">{{ patient.gender.display }}</p>
        <p class="blis_card_title">Identifier</p>
        <p class="blis_card_description">{{ patient.identifier }}</p>
        <p class="blis_card_title">Date of Birth</p>
        <p class="blis_card_description">{{patient.birth_date}}</p>
        <div class="blis_card_footer">
          <v-btn class="blis_card_button" small title="Edit" color="secondary" round v-if="$can('request_test')" @click="requestTest(patient)">
            <v-icon left dark>add_circle</v-icon>
            New Test
          </v-btn>
          <div class="blis_card_footer_right">
            <v-btn outline fab title="Edit" color="info" small v-if="$can('manage_patients')" @click="editItem(patient)">
              <v-icon dark>edit</v-icon>
            </v-btn>
            <v-btn outline fab title="Edit" color="warn" small v-if="$can('manage_patients') &&  patient.encounter && patient.encounter.length == 0" @click="deleteItem(patient)">
              <v-icon dark>delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-flex>
    </v-layout>
    <div v-if="length" class="text-xs-center">
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
</style>

<script>
  import apiCall from '../../utils/api'
  import testrequest from './testrequest'
  import { EventBus } from './../../main.js'
  import Vue from 'vue'

  export default {
    name:'Patient',
    components: {
      testrequest,
    },
    data: () => ({
      loading: false,
      loadingDialog: {
        loading: false,
        message: ""
      },
      y: 'top',
      color: 'success',
      message: '',
      snackbar: false,
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
      patients: [],
      patient: {},
      editedIndex: -1,
      editedItem: {
        identifier: '',
        name: '',
        gender_id: '',
        birth_date: '',
        gender: ''

      },
      defaultItem: {
        identifier: '',
        name: '',
        gender_id: '',
        birth_date: '',
        gender: '',

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
      loadingMethod(load, message="") {
        this.loadingDialog.loading = load;
        this.loadingDialog.message = message
      },
      initialize () {
        
        this.loadingMethod(true, "Fetching All Patients")
        this.query = 'page='+ this.pagination.page;
        if (this.search != '') {
            this.query = '&search='+this.search;
        }
        apiCall({url: '/api/patient?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.patients = resp.data;
          this.pagination.total = resp.total;
          this.pagination.per_page = resp.per_page;
          this.loadingMethod(false)
        })
        .catch(error => {
          console.log(error.response)
          this.loadingMethod(false)
        })
      },
      toPatientHistory(patient){
        this.$router.push({ name: 'patient_reports_single', params: { id: patient.id } })
      },
      newItem(){
        Vue.set(this,"dialog",true);
      },
      editItem (item) {
        this.editedIndex = this.patients.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        confirm('Are you sure you want to delete this item?') && (this.delete = true)
        if (this.delete) {
          this.loadingMethod(true, "Deleting Patient")
          const index = this.patient.indexOf(item)
          this.patient.splice(index, 1)
          apiCall({url: '/api/patient/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp)
            this.message = 'Patient Deleted Succesfully';
            this.snackbar = true;
            this.loadingMethod(false)
          })
          .catch(error => {
            console.log(error.response)
            this.loadingMethod(false)
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
      },
      requestTest (patient) {
        this.$refs.testRequestForm.modal(patient);
      },
      save () {
        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          this.loadingMethod(true, "Updating Patient")
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/patient/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              this.loading = false
              Object.assign(this.patients[this.editedIndex], resp)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.message = 'Patient Information Updated Succesfully';
              this.snackbar = true;
              this.loadingMethod(false)
            })
            .catch(error => {
              this.loading = false
              console.log(error.response)
              this.loadingMethod(false)
            })
            this.close()
          }
        // store
        } else {
          // this.loadingMethod(true, "Adding Patient")
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/patient', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.loading = false
              this.editedItem.id = resp.id
              this.editedItem.gender = resp.gender
              this.editedItem.name = resp.name
              this.editedItem.identifier = resp.identifier
              this.patients.push(this.editedItem)
              console.log(this.editedItem)
              this.resetDialogReferences();
              this.saving = false;
              this.message = 'Patient Added Succesfully';
              this.snackbar = true;
              this.loadingMethod(false)
            })
            .catch(error => {
              this.loading = false
              console.log(error.response)
              this.loadingMethod(false)
            })
            this.close()
          }
        }
      }
    }
  }
</script>