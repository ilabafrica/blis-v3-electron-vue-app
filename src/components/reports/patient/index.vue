<template>
  <div>
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
    <v-data-table
      :headers="headers"
      :items="patients"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.identifier }}</td>
        <td class="text-xs-left">
          {{ props.item.name.given }}
          {{ props.item.name.family }}
        </td>
        <td class="text-xs-left">{{ props.item.gender.display }}</td>
        <td class="text-xs-left">{{ props.item.birth_date }}</td>
        <td class="justify-left layout px-0">          
          <v-btn
            outline
            small
            title="View Patient History"
            color="green"
            flat
            v-if="$can('view_reports') && props.item.encounters && props.item.encounters.length != 0"
            @click.native="openPDF(props.item.id)"
            >
            <!-- :to="{name:'patient_reports_single', params:{id:props.item.id}}" -->
            Report
            <v-icon right dark>list_alt</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
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
<script>
  import apiCall from '../../../utils/api'
  import { EventBus } from '../../../main.js';
  import Vue from 'vue';

  export default {
    name:'PatientReport',
    components: {
    },
    data: () => ({
      calendar: false,
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
          this.patients = resp.data;
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
        this.editedIndex = this.patients.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.patients.indexOf(item)
          this.patients.splice(index, 1)
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

      openPDF(patient_id){
        window.open(process.env.VUE_APP_API_URL+"/api/stats/results/patient?pdf=true&patient_id="+patient_id, "_blank");
      },

      save () {

        this.saving = true;
        // update
        if (this.editedIndex > -1) {

          apiCall({url: '/api/patient/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
          .then(resp => {
            Object.assign(this.patients[this.editedIndex], this.editedItem)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
          })
          .catch(error => {
            console.log(error.response)
          })

        // store
        } else {

          apiCall({url: '/api/patient', data: this.editedItem, method: 'POST' })
          .then(resp => {
            this.patients.push(this.editedItem)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
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