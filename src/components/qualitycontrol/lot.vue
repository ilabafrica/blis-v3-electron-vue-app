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
        New Item
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
                  v-model="editedItem.number"
                  :rules="[v => !!v || 'Lot Number is Required' ,
                  v => /^[0-9]+$/.test(v)  || 'Lot Number should have numeric chars only']"
                  label="Lot Number">
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
                <v-menu>
                  <v-text-field :rules="[v => !!v || 'Expiry Date is Required']" :value="editedItem.expiry" slot="activator" label="Expiry Date"></v-text-field>
                  <v-date-picker v-model="editedItem.expiry"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-select
                  :items="instruments"
                  v-model="editedItem.instrument_id"
                  item-text="name"
                  item-value="id"
                  label="Instrument"
                ></v-select>
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
      Lots
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
      :items="lot"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.number }}</td>
        <td class="text-xs-left">{{ props.item.expiry }}</td>
        <td class="justify-left layout px-0">
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
  import apiCall from '../../utils/api'
  export default {
    name:'Lot',
    data: () => ({
      loading: false,
      message:'',
      y: 'top',
      color: 'success',
      landscape: true,
      reactive: true,
      instruments: [],
      lot: [],
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
        { text: 'Lot Number', value: 'number' },
        { text: 'Expiry Date', value: 'expiry' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        number: '',
        description: '',
        expiry: '',
        instrument_id: '',
      },
      defaultItem: {
        number: '',
        description: '',
        expiry: '',
        instrument_id: '',       
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

        apiCall({url: '/api/lot?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.lot = resp.data;
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/api/instrument', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.instruments = resp.data;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.lot.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.lot.indexOf(item)
          this.lot.splice(index, 1)
          apiCall({url: '/api/lot/'+item.id, method: 'DELETE' })
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
      },

      save () {

        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          this.loading = true
          apiCall({url: '/api/lot/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
          .then(resp => {
            Object.assign(this.lot[this.editedIndex], resp)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
              this.message = 'Lot Updated Succesfully';
            this.snackbar = true;
            this.loading = false
          })
          .catch(error => {
            this.loading = false
            console.log(error.response)
          })

        // store
        } else {
          this.loading = true
          apiCall({url: '/api/lot', data: this.editedItem, method: 'POST' })
          .then(resp => {
            this.lot.push(resp)
            console.log(resp)
            this.resetDialogReferences();
            this.saving = false;
            this.message = 'New Lot Added Succesfully';
            this.snackbar = true;
            this.loading = false
          })
          .catch(error => {
            console.log(error.response)
            this.loading = false
          })
        }
        this.close()

      }
    }
  }
</script>