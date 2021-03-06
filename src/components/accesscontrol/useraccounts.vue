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
      <v-btn
        outline
        small
        color="primary"
        slot="activator"
        flat>
        New User
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
                  v-model="editedItem.username"
                  :rules="[v => !!v || 'Username is Required']"
                  label="Username">    
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                 v-model="editedItem.name"
                  :rules="[v => !!v || 'Name is Required',
                  v => /^[a-zA-Z\s]+$/.test(v)  || 'Name should have alphabetic chars only']"
                  label="Name">
                </v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field
                  v-model="editedItem.email"
                  :rules="[v => !!v || 'Email is Required',v => /.+@.+/.test(v)  || 'Email not valid' ]"
                  label="Email Address">
                </v-text-field>
              </v-flex>
              <div>
                <v-btn small color="primary" dark @click.native="passordReset">Reset Password</v-btn>
              </div>
              <v-flex xs12 sm12 md12
                v-if="showPasswordField">
                <v-text-field
                  v-model="password"
                  :rules="[v => !!v || 'New Password is Required']"
                  type = "text"
                  append-icon="autorenew"
                  @click:append="generate"
                  label="New Password">
                </v-text-field>
              </v-flex>
              <v-flex xs3 offset-xs9 text-xs-right>
                <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
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
      Users
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
    :items="user"
    hide-actions
    class="elevation-1"
  >
    <template slot="items" slot-scope="props">
      <td>{{ props.item.username }}</td>
      <td class="text-xs-left">{{ props.item.name }}</td>
      <td class="text-xs-left">{{ props.item.email }}</td>
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
            title="Edit"
            color="pink"
            flat
            v-if="props.item.specimen_collected.length == 0 && props.item.specimen_received.length == 0"
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
    name:'UserAccounts',
    data: () => ({
      valid: true,
      dialog: false,
      snackbar: false,
      message: '',
      delete: false,
      saving: false,
      size: 32,
      y: 'top',
      color: 'success',
      characters: 'a-z,A-Z,0-9,#',
      showPasswordField: false,
      search: '',
      query: '',
      password: '',
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Username', align: 'left', value: 'username' },
        { text: 'Name', value: 'name' },
        { text: 'Email Address', value: 'email' },
        { text: 'Actions', sortable: false, value: 'action' }
      ],
      user: [],
      editedIndex: -1,
      editedItem: {
        username: '',
        name: '',
        email: ''
      },
      defaultItem: {
        username: '',
        name: '',
        email: ''
      }
    }),
    created () {
      this.initialize()
    },

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

    methods: {
      initialize () {

        this.query = 'page='+ this.pagination.page;
        if (this.search != '') {
            this.query = this.query+'&search='+this.search;
        }

        apiCall({url: '/api/user?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp)
          this.user = resp.data;
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;
        })
        .catch(error => {
          console.log(error.response)
        })
      },
      editItem (item) {
        this.editedIndex = this.user.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      generate: function() {
        let charactersArray = this.characters.split(',');  
        let CharacterSet = '';
        let password = '';
        
        if( charactersArray.indexOf('a-z') >= 0) {
          CharacterSet += 'abcdefghijklmnopqrstuvwxyz';
        }
        if( charactersArray.indexOf('A-Z') >= 0) {
          CharacterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if( charactersArray.indexOf('0-9') >= 0) {
          CharacterSet += '0123456789';
        }
        if( charactersArray.indexOf('#') >= 0) {
          CharacterSet += '![]{}()%&*$#^<>~@|';
        }
        
        for(let i=0; i < this.size; i++) {
          password += CharacterSet.charAt(Math.floor(Math.random() * CharacterSet.length));
        }
        this.password = password;
      },
      deleteItem (item) {
        confirm('Are you sure you want to delete this user?') && (this.delete = true)
        if (this.delete) {
          const index = this.user.indexOf(item)
          this.user.splice(index, 1)
          apiCall({url: '/api/user/'+item.id, method: 'DELETE' })
          .then(resp => {
            console.log(resp.data)
            this.message = 'User Deleted Succesfully';
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
        this.showPasswordField = false
        this.password = ''
      },

      passordReset () {
        if (this.showPasswordField){
          this.showPasswordField = false
          this.password = ''
        }else{
          this.showPasswordField = true;
        }
      },

      save () {

        this.saving = true;
        // update
        if (this.editedIndex > -1) {
          if(this.$refs.form.validate()){
            if(this.showPasswordField){
              this.editedItem.adminPasswordChange = true
              this.editedItem.password = this.password
            }
            apiCall({url: '/api/user/'+this.editedItem.id, data: this.editedItem, method: 'PUT' })
            .then(resp => {
              Object.assign(this.user[this.editedIndex], this.editedItem)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.message = 'User Information Updated Succesfully';
              this.snackbar = true;
            })
            .catch(error => {
              console.log(error.response)
            })
            this.close()
          }
        // store
        } else {
          if(this.$refs.form.validate()){
            apiCall({url: '/api/user', data: this.editedItem, method: 'POST' })
            .then(resp => {
              this.user.push(resp)
              console.log(resp)
              this.resetDialogReferences();
              this.saving = false;
              this.message = 'New User Added Succesfully';
              this.snackbar = true;
            })
            .catch(error => {
              console.log(error.response)
            })
            this.close()
          }
        }
      }
    },
  }
</script>