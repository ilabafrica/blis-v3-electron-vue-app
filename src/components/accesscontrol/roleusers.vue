<template>
  <div>
    <v-card-title>
      Permissions
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
      :items="users"
      hide-actions
      class="elevation-1">

      <template slot="items" slot-scope="row">
        <tr :key="row.item.id">
          <td>{{row.item.name}}</td>
          <td
            v-for="role in roles"
            :key="role.id">
            {{row.item.id}}_{{role.id}}
              <v-checkbox
                v-model="roleUserIds"
                :value="row.item.id+'_'+role.id"
                v-on:click="toggleAssignment(row.item,role,row.item.id+'_'+role.id)">
              </v-checkbox>
            </td>
          </tr>
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
  import _ from 'lodash'
  import Vue from 'vue'

  export default {
    name: 'RoleUser',
    data: () => ({
      valid: true,
      search: '',
      query: '',
      headers: [
        { text: 'Users', value: 'users' },
      ],
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      roleUserIds: [],
      users: [],
      roles: [],
    }),

    computed: {

      length: function() {
        return Math.ceil(this.pagination.total / this.pagination.per_page);
      },
    },

    beforeCreate() {
      apiCall({url: '/api/role', method: 'GET' })
        .then(resp => {
          console.log(resp)
        this.roles = resp;
        for (var i = 0; i < resp.length; i++) {
          this.headers.push({
            text: resp[i].name,
            value: resp[i].name
          })
        }
      })
      .catch(error => {
        console.log(error.response)
      })
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

        apiCall({url: '/api/user?' + this.query, method: 'GET' })
        .then(resp => {
          console.log(resp.data)
          this.users = resp.data;
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;

          /*
           * get value for array of checked (user_id,role_id) combination
           * check box seems to only work with zero based indexing
           */
          var index = 0;
          for (var i = this.users.length - 1; i >= 0; i--) {
            // if there are any roles
            for (var j = this.users[i].roles.length - 1; j >= 0; j--) {
              this.roleUserIds[index] = this.users[i].id+'_'+this.users[i].roles[j].id;
              index++;
            }
          }
        })
        .catch(error => {
          console.log(error.response)
        })
      },

      toggleAssignment (user,role,roleUserId) {

        this.query = 'user_id='+ user.id+'&&role_id='+ role.id;
        if (_.includes(this.roleUserIds, roleUserId)) {

          console.log('dettach user-role')
          // detach
          apiCall({
            url: '/api/roleuser/detach?'+this.query,
            method: 'GET'
          }).then(response => {
            console.log(response)
            // _.remove(this.roleUserIds, item => item === roleUserId);
            this.roleUserIds.splice(this.roleUserIds.indexOf(roleUserId),1);
          })
          .catch(error => {
            console.log(error.response)
          })
        } else {

          console.log('attach user-role')
          // attach
          apiCall({
            url: '/api/roleuser/attach?'+this.query,
            method: 'GET'
          })
          .then(response => {
            this.roleUserIds.push(roleUserId);
          })
          .catch(error => {
            console.log(error.response)
          })
        }
      },

    }
  }
</script>