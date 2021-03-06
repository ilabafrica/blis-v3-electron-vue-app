<template>
  <div>
      <v-snackbar
        v-model="snackbar"
        :color="color"
        :timeout="6000"
      :top="y === 'top'"
      >
        {{message}}
     </v-snackbar>
    <v-dialog v-model="dialog" max-width="500px">
      <v-btn slot="activator" color="primary" dark class="mb-2" outline>
        New Supplier
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
                 v-model="editedItem.name"
                  :rules="[v => !!v || 'Name is Required' ,
                  v => /^[a-zA-Z\s]+$/.test(v)  || 'Name should have alphabetic chars only']"
                  label="Name">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.phone"
                    :rules="[v => !!v || 'Phone is Required']"
                    label="Phone">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                  v-model="editedItem.email"
                  :rules="[v => !!v || 'Email is Required',v => /.+@.+/.test(v)  || 'Email not valid' ]"
                  label="Email Address">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.address"
                    :rules="[v => !!v || 'Address is Required']"
                    label="Address">
                  </v-text-field>
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

    <v-card-title>
      Suppliers
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
      :items="supplier"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-left">{{ props.item.phone }}</td>
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
  import Vue from 'vue'
  export default {
    name:'InventorySupplier',
    data: () => ({
      loading: false,
      valid: true,
      dialog: false,
      snackbar: false,
      message:'',
      y: 'top',
      color: 'success',
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
        { text: 'Phone', value: 'phone' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      supplier: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        phone: '',
        email: '',
        address: '',
      },
      defaultItem: {
        name: '',
        phone: '',
        email: '',
        address: '',
      }
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },

      length: function() {
        return Math.ceil(this.pagination.total / 10);
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

        apiCall({url: '/supplier?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.supplier = resp.data;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.supplier.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.supplier.indexOf(item)
          this.supplier.splice(index, 1)
          apiCall({url: '/supplier/'+item.id, method: 'DELETE' })
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
          if(this.$refs.form.validate()){
            this.loading = true
            apiCall({url: '/supplier/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              Object.assign(this.supplier[this.editedIndex], this.editedItem)
              Vue.set(this,"supplier",supplier)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
              this.message = 'Supplier Updated Succesfully';
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
            apiCall({url: '/supplier', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.supplier.push(resp)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
              this.message = 'New Supplier Added Succesfully';
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