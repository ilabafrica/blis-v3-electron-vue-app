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
      Measures
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="testResultMappings"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.emr_alias }}</td>
        <td class="text-xs-left">{{ props.item.measure_range.display }}</td>
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
  export default {
    name:'EMRResultMapping',
    data: () => ({
      loading: false,
      valid: true,
      dialog: false,
      delete: false,
      saving: false,
      headers: [
        { text: 'EMR Alias', value: 'emr_test_type_alias_id' },
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
        apiCall({url: '/api/mapresultget/'+this.$route.params.emrTestTypeAliasId, method: 'GET' })
        .then(resp => {
          console.log('listings mapresultget')
          console.log(resp)
          this.testResultMappings = resp;
        })
        .catch(error => {
          console.log(error.response)
        })

        // measure ranges
        apiCall({url: '/api/measure/'+this.$route.params.measureId, method: 'GET' })
        .then(resp => {
          console.log('listings mapresultget measure ranges')
          console.log(resp.measure_ranges)
          this.measureRanges = resp.measure_ranges;
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      editItem (item) {
        this.editedIndex = this.testResultMappings.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true

      },

      deleteItem (item) {

        confirm('Are you sure you want to delete this item?') && (this.delete = true)

        if (this.delete) {
          const index = this.testResultMappings.indexOf(item)
          this.testResultMappings.splice(index, 1)
          apiCall({url: '/api/mapresultdestroy/'+item.id, method: 'GET' })
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

        this.editedItem.emr_test_type_alias_id = this.$route.params.emrTestTypeAliasId
        this.saving = true;
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
</script>