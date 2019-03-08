<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-btn slot="activator" color="primary" dark class="mb-2" outline>
        New Item Request
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
                  <v-select
                    :items="items"
                    :rules="[v => !!v || 'Instrument is Required']"
                    v-model="editedItem.item_id"
                    item-text="name"
                    item-value="id"
                    label="Instrument"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.curr_bal"
                    :rules="[v => !!v || 'Current Balance is Required']"
                    label="Current Balance">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-select
                    :items="labsections"
                    :rules="[v => !!v || 'Lab Section is Required']"
                    v-model="editedItem.lab_section_id"
                    item-text="name"
                    item-value="id"
                    label="Lab Section"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.tests_done"
                    :rules="[v => !!v || 'Tests Done is Required']"
                    label="Tests Done">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.quantity_requested"
                    :rules="[v => !!v || 'Quantity Requested. is Required']"
                    label="Quantity Requested.">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.remarks"
                    :rules="[v => !!v || 'Remarks is Required']"
                    label="Remarks">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>          
            <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
              Save <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="detailsdialog"
      max-width="500"
    >
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Request Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="detailsdialog = false">
            Cancel
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text> 
        <p><span class="grey--text pa-2">Lab Section: </span>{{editedItem.lab.name}}</p>      
          
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card-title>
      Requests
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
      :items="request"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.created_at }}</td>
        <td class="text-xs-left">{{ props.item.user.name }}</td>
        <td class="text-xs-left">{{ props.item.item.name }}</td>
        <td class="text-xs-left">{{ props.item.quantity_requested }}</td>
        <td class="text-xs-left">{{ props.item.quantity_issued }}</td>
        <td class="text-xs-left">
          <v-btn small color="primary" dark>{{ props.item.status.name }}</v-btn>
        </td>
        <td class="justify-center layout px-0">
          <v-btn
            outline
            small
            title="Edit"
            color="success"
            flat
            @click="viewItem(props.item)">
            View
            <v-icon right dark>remove_red_eye</v-icon>
          </v-btn>
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
    name:'InventoryRequest',
    data: () => ({
      valid: true,
      dialog: false,
      detailsdialog: false,
      delete: false,
      saving: false,
      items: [],
      labsections: [],
      search: '',
      query: '',
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Requested By', value: 'requested_by' },
        { text: 'Item', value: 'item' },
        { text: 'Quantity Requested', value: 'quantity_requested' },
        { text: 'Quantity Issued', value: 'quantity_issued' },
        { text: 'Status', value: 'quantity_issued' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      request: [],
      editedIndex: -1,
      editedItem: {
        item_id: '',
        curr_bal: '',
        lab_section_id: '',
        tests_done: '',
        quantity_requested: '',
        remarks: '',
        lab: '',
      },
      defaultItem: {
        item_id: '',
        curr_bal: '',
        lab_section_id: '',
        tests_done: '',
        quantity_requested: '',
        remarks: '',
        lab: '',
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

        apiCall({url: '/request?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.request = resp.data;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/item', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.items = resp.data;
        })
        .catch(error => {
          console.log(error.response)
        })

        apiCall({url: '/api/testtypecategory', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.labsections = resp.data;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.request.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      viewItem (item) {
        this.editedIndex = this.request.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.detailsdialog = true
      },      

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.request.indexOf(item)
          this.request.splice(index, 1)
          apiCall({url: '/request/'+item.id, method: 'DELETE' })
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
            apiCall({url: '/request/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              Object.assign(this.request[this.editedIndex], resp)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
            })
            .catch(error => {
              console.log(error.response)
            })
            this.close()
          }
        // store
        } else {
          if(this.$refs.form.validate()){
            apiCall({url: '/request', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.request.push(resp)
              this.resetDialogReferences();
              this.saving = false;
            })
            .catch(error => {
              console.log(error.response)
            })
            this.close()
          }
        }
      }
    }
  }
</script>