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
      <v-btn
        outline
        small
        color="primary"
        slot="activator"
        flat>
        New Facility
        <v-icon right dark>playlist_add</v-icon>
      </v-btn>
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Facility</v-toolbar-title>
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
                  v-model="editedItem.name"
                  :rules="[v => !!v || 'Name is Required']"
                  label="Name">
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

    <v-card-title>
      Facility
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
      :items="organization"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="justify-center layout px-0">
          <v-btn
            outline
            small
            title="Edit"
            color="teal"
            flat
            @click="editItem(props.item)">
            Edit
            <v-icon right dark>edit</v-icon>
          </v-btn>
          <v-btn
            outline
            small
            title="Delete"
            color="pink"
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
  import apiCall from '../../utils/api'
  export default {
    name: 'Organization',
    data: () => ({
      loading: false,
      snackbar: false,
      message:'',
      y: 'top',
      color: 'success',    
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
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
        { text: 'Actions', value: 'name', sortable: false }
      ],
      organization: [],
      editedIndex: -1,
      editedItem: {
        name: '',
      },
      defaultItem: {
        name: '',
      }
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

        apiCall({url: '/api/organization?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.organization = resp.data;
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.organization.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.organization.indexOf(item)
          this.organization.splice(index, 1)
          apiCall({url: '/api/organization/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp)
            this.message = 'Lab Section Deleted Succesfully';
            this.snackbar = true;
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
      },

      save () {

        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/api/organization/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              this.loading = false
              Object.assign(this.organization[this.editedIndex], this.editedItem)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.message = 'Facility Updated Succesfully';
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
            apiCall({url: '/api/organization', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.loading = false
              this.editedItem.id = resp.id
              this.organization.push(this.editedItem)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;

               this.message = 'Health Facility Added Succesfully';
               this.snackbar = true;
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
  }
</script>