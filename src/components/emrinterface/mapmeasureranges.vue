<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-toolbar dark color="primary" class="elevation-0">
          <v-toolbar-title>Map Measure Ranges</v-toolbar-title>
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
                      :items="measures"
                      v-model="measure_id"
                      item-text="name"
                      item-value="id"
                      label="Measure">
                    </v-select>
                  </v-flex>
                  <v-flex xs3 offset-xs6 text-xs-right>
                    <v-btn round outline xs12 sm6 color="blue darken-1" :disabled="!valid" @click.native="save">
                      Map Results <v-icon right dark>tune</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    data: () => ({
      valid: true,
      dialog: false,
      measure_id: '',
      measures: [],
      testType: {},
    }),

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {

      modal (testType) {
        this.testType = testType;
        this.measures = testType.measures;
        this.dialog = true;
      },

      close () {
        this.dialog = false
      },
      save () {
        console.log('"save"')
        this.$router.push({ name: 'EMRResultMapping', params: { emrTestTypeAliasId: this.testType.id,measureId: this.measure_id } })
        this.close()
      }
    }
  }
</script>
