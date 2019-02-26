<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-btn slot="activator" color="primary" dark class="mb-2" outline>
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
                    v-model="editedItem.emr_test_type_alias_id"
                    :rules="[v => !!v || 'EMR Test Type Alias is Required']"
                    label="EMR Test Type Alias">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-select
                    :items="measureRanges"
                    :rules="[v => !!v  || 'Measure Range is Required']"
                    v-model="editedItem.measure_range_id"
                    item-text="display"
                    item-value="id"
                    label="Measure Range">
                  </v-select>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.emr_alias"
                    :rules="[v => !!v || 'EMR Alias is Required']"
                    label="EMR Alias">
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
  </div>
</template>
<script>
  import apiCall from '../../utils/api'
  import Vue from 'vue'
  export default {
    name:'EMRResultMapping',
    data: () => ({
      loading: false,
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
      headers: [
        { text: 'EMR Test Type Alias', value: 'emr_test_type_alias_id' },
        { text: 'Measure Range', value: 'measure_range_id' },
        { text: 'EMR Alias', value: 'emr_alias', sortable: false }
      ],
      testResultMappings: [],
      measureRanges: [],
      editedIndex: -1,
      editedItem: {
        emr_test_type_alias_id: '',
        measure_range_id: '',
        emr_alias: '',
      },
      defaultItem: {
        emr_test_type_alias_id: '',
        measure_range_id: '',
        emr_alias: '',
      }
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
        // results mappings
        apiCall({url: '/api/mapresultget/'+this.$route.params.testTypeId, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testResultMappings = resp.data;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.testResultMappings.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true

        // measureRanges
        /*apiCall({url: '/api/measure/'+this.$route.params.measureId+'/measurerange', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.measureRanges = resp;
        })
        .catch(error => {
          console.log(error.response)
        })*/
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.testResultMappings.indexOf(item)
          this.testResultMappings.splice(index, 1)
          apiCall({url: '/api/mapresultdestroy/'+item.id, method: 'DELETE' })
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
            apiCall({url: '/api/mapresultstore/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              // let testResultMapping = resp
              Object.assign(this.testResultMappings[this.editedIndex], this.editedItem)
              // Vue.set(this,"testResultMappings", testResultMappings)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
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
            apiCall({url: '/api/mapresultstore', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.testResultMappings.push(this.editedItem)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.loading = false
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