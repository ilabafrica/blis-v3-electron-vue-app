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
    <TestTypeDetail ref="testTypeDetailForm"></TestTypeDetail>
    <v-layout row>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn
          outline
          small
          color="primary"
          slot="activator"
          flat>
          New Test Type
          <v-icon right dark>playlist_add</v-icon>
        </v-btn>
        <v-card>
          <v-toolbar dark color="primary" class="elevation-0">
            <v-toolbar-title>Test Details</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn round outline color="blue lighten-1" flat @click.native="close">
              Cancel
              <v-icon right dark>close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-form ref="form" v-model="valid" lazy-validation>
          <v-card-text>
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="editedItem.name"
                :rules="[v => !!v || 'Name is Required' , 
                v => /^[a-zA-Z\s]+$/.test(v)  || 'Name should have alphabetic chars only']"
                label="Name">
              </v-text-field>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="editedItem.description"
                :rules="[v => !!v || 'Description is Required']"
                label="Description">
              </v-text-field>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-text-field
                v-model="editedItem.targetTAT"
                :rules="[v => !!v || 'Target Turnaround Time is Required']"
                label="Target Turnaround Time">
              </v-text-field>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-select
                :items="testTypeCategories"
                v-model="editedItem.test_type_category_id"
                item-text="name"
                item-value="id"
                label="Lab Section"
              ></v-select>
            </v-flex>
            <v-flex xs12 sm12 md12>
              <v-checkbox
                v-model="editedItem.culture"
                value="1"
                label="Use Culture Options">
              </v-checkbox>
            </v-flex>
            <v-flex xs3 offset-xs9 text-xs-right>
              <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="saveTestType" :loading="loading">
                Save <v-icon right dark>cloud_upload</v-icon>
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-form>
        </v-card>
      </v-dialog>
    </v-layout>
    <v-card-title>
      Test Type
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
      :items="testTypes"
      hide-actions
      class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-left">{{ props.item.test_type_category.name }}</td>
        <td class="justify-left layout px-0">
          <v-btn
            outline
            small
            title="View"
            color="green"
            flat
            @click="view(props.item)">
            View
            <v-icon right dark>visibility</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            title="View"
            color="teal"
            flat
            @click="editItem(props.item)">
            Edit
            <v-icon right dark>edit</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            :to="{ name: 'SpecimenType', params: { testTypeId:props.item.id} }"
            title="Specimen Types"
            color="green"
            flat
            v-if="$can('manage_test_catalog')">
            Specimen Types
            <v-icon right dark>list</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            :to="{ name: 'Measure', params: { testTypeId:props.item.id} }"
            title="Measures"
            color="blue"
            flat
            v-if="$can('manage_test_catalog')">
            Measures
            <v-icon right dark>list</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            title="Delete"
            color="pink"
            v-if="$can('manage_test_catalog') && props.item.test_type_mapping.length == 0"
            flat
            @click="deleteItem(props.item)">
            Delete
            <v-icon right dark>delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
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
<script>
  import apiCall from '../../../utils/api'
  import TestTypeDetail from './testtypedetail'
  export default {
    name: 'TestType',
    components: {
      TestTypeDetail,
    },
    data: () => ({
      loading: false,
      snackbar: false,
      message:'',
      y: 'top',
      color: 'success',
      dialog: false,
      valid: true,
      delete: false,
      saving: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        description: '',
        test_type_category_id: '',
        targetTAT: '',
        culture: 0,
      },
      defaultItem: {
        name: '',
        description: '',
        test_type_category_id: '',
        targetTAT: '',
        culture: 0,
      },
      testTypes: [],
      testTypeCategories: [],
      items: [],
      
      search: '',
      query: '',
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Test Category', value: 'test_type_category_id' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
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

    methods: {

      initialize () {

        this.query = 'page='+ this.pagination.page;
        if (this.search != '') {
            this.query = this.query+'&search='+this.search;
        }

        apiCall({url: '/api/testtype?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testTypes = resp.data;
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/api/testtypecategory', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testTypeCategories = resp.data;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      view (item) {
        console.log(item)
        this.$refs.testTypeDetailForm.modal(item);
      },

      editItem (item) {
        this.editedIndex = this.testTypes.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.testTypes.indexOf(item)
          this.testTypes.splice(index, 1)
          apiCall({url: '/api/testtype/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp)
            this.message = 'Test Type Deleted Succesfully';
            this.snackbar = true;
          })
          .catch(error => {
            console.log(error.response)
          })
        }
      },

      close () {
        this.dialog = false
        if (!this.saving) {
          this.resetDialogReferences();
        }
      },

      resetDialogReferences() {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editLevel = 1
      },

      saveTestType () {

        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/testtype/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              Object.assign(this.testTypes[this.editedIndex], resp)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
              this.message = 'Test Type Updated Succesfully';
              this.snackbar = true;

            })
            .catch(error => {
              this.loading = false
              console.log(error.response)
            })
            this.close()
          }
        // store
        } else {
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/testtype', data: this.editedItem, method: 'POST' })
            .then(resp => {
              console.log(resp)
              this.testTypes.push(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
              this.message = 'New Test Type Added Succesfully';
              this.snackbar = true;
            })
            .catch(error => {
              this.loading = false
              console.log(error.response)
            })
            this.close()
          }
        }
      },
    }
  }
</script>