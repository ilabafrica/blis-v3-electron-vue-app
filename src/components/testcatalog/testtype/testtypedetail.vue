<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Test Type Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="close">
            Cancel
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text v-if="item.id">
          <p><span class="grey--text pa-2">Test Type Name: </span>{{item.name}}</p>
          <p><span class="grey--text pa-2">Description: </span>{{item.description}}</p>
          <p><span class="grey--text pa-2">Culture: </span>{{item.culture}}</p>
          <p><span class="grey--text pa-2">Test Type Category: </span>{{item.test_type_category.name}}</p>
          <p><span class="grey--text pa-2">targetTAT: </span>{{item.targetTAT}}</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name:'TestTypeDetail',
    data: () => ({
      calendar: false,
      landscape: true,
      reactive: true,
      valid: true,
      dialog: false,
      item: {}
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      modal (item) {
        this.item = item;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },
    }
  }
</script>
