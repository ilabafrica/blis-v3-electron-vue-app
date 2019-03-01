<template>
  <div>
    <mapmeasureranges ref="mapMeasureRangesForm"></mapmeasureranges>
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
                  <v-select
                    :items="clients"
                    :rules="[v => !!v  || 'Client ID is Required']"
                    v-model="editedItem.client_id"
                    item-text="name"
                    item-value="id"
                    label="Client ID">
                  </v-select>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-select
                    :items="testTypes"
                    :rules="[v => !!v  || 'Test Type is Required']"
                    v-model="editedItem.test_type_id"
                    item-text="name"
                    item-value="id"
                    label="Test Type">
                  </v-select>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.emr_alias"
                    :rules="[v => !!v || 'EMR Alias is Required']"
                    label="EMR Alias">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.system"
                    :rules="[v => !!v || 'System is Required']"
                    label="System">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.code"
                    :rules="[v => !!v || 'Code is Required']"
                    label="Code">
                  </v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md12>
                  <v-text-field
                    v-model="editedItem.display"
                    :rules="[v => !!v || 'Display is Required']"
                    label="Display">
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
      Test Types
      <v-spacer></v-spacer>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="testTypeMappings"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.client_id }}</td>
        <td>{{ props.item.emr_alias }}</td>
        <td class="text-xs-left">{{ props.item.test_type.name }}</td>
        <td class="justify-left layout px-0">
          <v-btn
            outline
            small
            title="Measures"
            color="info"
            flat
            @click="mapMeasureRanges(props.item.test_type)">
            Measures
            <v-icon right dark>tune</v-icon>
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
  // import Vue from 'vue'
  import mapmeasureranges from './mapmeasureranges'
  export default {
    name:'EMRTestTypeMapping',
    components: {
      mapmeasureranges,
    },
    data: () => ({
      loading: false,
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Client Id', value: 'client_id' },
        { text: 'EMR Alias', value: 'emr_alias' },
        { text: 'Test Type', value: 'test_type_id' },
        { text: 'Actions', value: 'emr_alias', sortable: false }
      ],
      testTypeMappings: [],
      testTypes: [],
      clients: [],
      editedIndex: -1,
      editedItem: {
        client_id: '',
        test_type_id: '',
        emr_alias: '',
        system: '',
        code: '',
        display: '',
      },
      defaultItem: {
        client_id: '',
        test_type_id: '',
        emr_alias: '',
        system: '',
        code: '',
        display: '',
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
        // testtype mappings
        apiCall({url: '/api/maptesttypeget?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testTypeMappings = resp.data;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })

        // test types
        apiCall({url: '/api/testtype?fetch=1', method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.testTypes = resp;
        })
        .catch(error => {
          console.log(error.response)
        })

        // clients
        apiCall({url: '/api/emrclients', method: 'GET' })
        .then(resp => {
          console.log('clients')
          console.log(resp)
          this.clients = resp;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.testTypeMappings.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.testTypeMappings.indexOf(item)
          this.testTypeMappings.splice(index, 1)
          apiCall({url: '/api/maptesttypedestroy/'+item.id, method: 'DELETE' })
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

      mapMeasureRanges (testType) {
        // :to="{path:'/emr/testresultmapping/'+props.item.test_type_id}"
        console.log('mapMeasureRanges')
        this.$refs.mapMeasureRangesForm.modal(testType);
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
            apiCall({url: '/api/maptesttypestore', data: this.editedItem, method: 'POST' })
            .then(resp => {
              // let testTypeMapping = resp
              Object.assign(this.testTypeMappings[this.editedIndex], this.editedItem)
              // Vue.set(this,"testTypeMappings", testTypeMapping)
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
            apiCall({url: '/api/maptesttypestore', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.testTypeMappings.push(this.editedItem)
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