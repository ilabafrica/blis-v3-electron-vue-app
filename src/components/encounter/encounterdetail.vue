<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Visit Details</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn round outline color="blue lighten-1" flat @click.native="close">
            Close
            <v-icon right dark>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text v-if="encounter.patient">
          <p><span class="grey--text pa-2">Patient Name: </span>{{encounter.patient.name.family}}, {{encounter.patient.name.given}}</p>
          <p><span class="grey--text pa-2">Patient Gender: </span>{{encounter.patient.gender.display}}</p>
          <p><span class="grey--text pa-2">Date: </span>{{encounter.created_at}}</p>
          <p><span class="grey--text pa-2">Number of Tests Requested: </span>{{encounter.tests.length||0}}</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    data: () => ({
      calendar: false,
      landscape: true,
      reactive: true,
      valid: true,
      dialog: false,
      encounter: {}
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      modal (encounter) {
        this.encounter = encounter;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },
    }
  }
</script>
