<template>
  <div>
    <v-snackbar
      v-model="snackbar"
      :color="color"
      :timeout="6000"
      :top="y === 'top'"
    >
      {{ message }}
    </v-snackbar>
    <specimencollection ref="specimenCollectionForm"></specimencollection>
    <result ref="resultForm"></result>
    <specimenrejection ref="specimenRejectionForm"></specimenrejection>
    <referral ref="referralForm"></referral>
    <testdetail ref="testDetailForm"></testdetail>
    <v-dialog v-model="loadingDialog.loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          {{ loadingDialog.message }}
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card-title>
      <p class="blis_page_title">
        Tests
      </p>
      <v-spacer></v-spacer>
      <v-layout wrap>
        <v-flex xs12 md6>
          <v-layout style="margin-top: 0px;" align-start justify-end row fill-height>
            <v-btn-toggle class="blis_search">
              <v-btn @click="filterStatus(0)" color="secondary" flat>
                <span>All</span>
              </v-btn>
              <v-btn @click="filterStatus(2)" color="#2196F3" flat>
                <span>Started</span>
              </v-btn>
              <v-btn @click="filterStatus(1)" color="#FF9800" flat>
                <span>Pending</span>
              </v-btn>
              <v-btn @click="filterStatus(3)" color="#2F0074" flat>
                <span>Completed</span>
              </v-btn>
              <v-btn @click="filterStatus(4)" color="#4CAF50" flat>
                <span>Verified</span>
              </v-btn>
            </v-btn-toggle>
          </v-layout>
        </v-flex>
        <v-flex xs10 md6>
          <v-text-field class="blis_search" v-model="search" append-icon="search" label="Search" single-line v-on:keyup.enter="initialize" hide-details>
          </v-text-field>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-layout row wrap>
      <v-flex md4 v-for="test in tests" :key="test.id">
        <div class="blis_card" v-bind:style="{ 'border-right-color': test.status_color}">
          <div class="blis_card_top_right">
            <v-btn outline fab small title="Print" color="primaryb" v-if="test.results.length != 0" @click="getPDF(test.encounter.patient_id)">
              <v-icon dark>print</v-icon>
            </v-btn>
          </div>
          <p class="blis_card_main_heading">{{ test.encounter.patient.name.given }} {{ test.encounter.patient.name.family }}</p>
          <p class="blis_card_small_text">
            ({{ getGender(test.encounter.patient.gender.code) }},
              {{ getAge(test.encounter.patient.birth_date) }})
          </p>
          <p class="blis_card_title">Test</p>
          <p class="blis_card_description">{{ test.test_type.name }}</p>
          <p class="blis_card_title">Visit</p>
          <p class="blis_card_description" v-if="test.encounter.identifier">{{ test.encounter.identifier }}</p>
          <p class="blis_card_description" v-else>No Visits</p>
          <v-layout>
            <v-flex>
              <p class="blis_card_title">Specimen</p>
              <p class="blis_card_description" v-if="test.specimen">
                {{ test.specimen.specimen_type.name }}
              </p>
              <p class="blis_card_description" v-else>No Specimen</p>
            </v-flex>
            <v-flex>
              <v-btn class="blis_card_button" small title="New Test" color="error" round v-if="(test.test_status.code === 'started' || test.test_status.code === 'pending') && test.test_status.test_phase.code === 'analytical' && !test.specimen_rejection && $can('reject_test_specimen')" @click="rejectSpecimen(test)">
                <v-icon left dark>cancel</v-icon>
                Reject
              </v-btn>
            </v-flex>
          </v-layout>
          <p class="blis_card_title">Physician</p>
          <p class="blis_card_description">{{ test.requested_by }}</p>
          <p class="blis_card_title">Ordered</p>
          <p class="blis_card_description">{{ test.created_at }}</p>
          <div class="blis_card_footer">
            <v-btn outline fab title="Details" color="success" small @click="detail(test)">
              <v-icon dark>visibility</v-icon>
            </v-btn>
            <v-btn outline fab title="Print" color="primaryb" small v-if="test.specimen_id != null" @click="print(test.specimen_id)">
              <v-icon dark>gradient</v-icon>
            </v-btn>
            <v-btn outline fab title="Edit" color="accent" small v-if="!test.specimen_rejection && test.test_status.code === 'completed' && $can('enter_test_result')" @click="enterResults(test)">
              <v-icon dark>edit</v-icon>
            </v-btn>
            <div class="blis_card_footer_right">
              <v-btn class="blis_card_button" small title="Verify" color="secondary" round v-if="test.test_status.code === 'completed' && $can('verify_test_result')"
              @click="detail(test)">
                <v-icon>check_circle_outline</v-icon>
                Verify
              </v-btn>
              <v-btn class="blis_card_button" small title="Verify" color="secondary" disabled="disabled" round v-if="test.test_status.code === 'verified'"
              @click="detail(test)">
                <v-icon>check_circle_outline</v-icon>
                Verified
              </v-btn>
              <v-btn class="blis_card_button" small title="Collect" color="primary" round v-if="!test.specimen && $can('accept_test_specimen')"
              @click="collectSpecimen(test)">
                <v-icon left>gradient</v-icon>
                Collect
              </v-btn>
              <v-btn dark class="blis_card_button" small title="Start" color="blue" round v-if="!test.specimen_rejection && test.specimen && !test.specimen.referral && test.test_status.code === 'pending' && $can('start_test')"
              @click="start(test)">
                <v-icon left>play_arrow</v-icon>
                Start
              </v-btn>
              <v-btn dark class="blis_card_button" small title="Enter" color="blue" round v-if="!test.specimen_rejection && test.test_status.code === 'started' && $can('enter_test_result')"
              @click="enterResults(test)">
                <v-icon left>library_books</v-icon>
                Enter
              </v-btn>
              <v-btn dark class="blis_card_button" small title="Refer" color="amber" round v-if="test.test_status.code === 'pending' && test.specimen && !test.specimen.referral && $can('refer_test_specimen')"
              @click="refer(test)">
                <v-icon left>arrow_forward</v-icon>
                Refer
              </v-btn>
            </div>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <v-dialog v-model="showPDF" max-width="1000px">
      <PDFVuer
        v-if="pdf_url"
        :pdf_url="pdf_url"
      />
    </v-dialog>

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
  import Vue from 'vue'
  import PDFVuer from "@/components/PDFVuer.vue"
  import { EventBus } from './../../main.js';
  import apiCall from '../../utils/api'
  import specimencollection from './specimencollection'
  import specimenrejection from './specimenrejection'
  import testdetail from './testdetail'
  import referral from './referral'
  import result from './result'
import { resolve } from 'url';
import { log } from 'util';


  export default {
    name: 'Test',
      components: {
        PDFVuer,
        specimencollection,
        result,
        specimenrejection,
        referral,
        testdetail,
      },
    data: () => ({
      url_prefix: "/api/stats/",
      pdf_url: '',
      pdfdialog: false,
      showPDF: false,
      search: '',
      query: '',
      editedIndex: -1,
      message:'',
      y: 'top',
      color: 'success',
      snackbar: false,
      loadingDialog: {
        loading: false,
        message: ""
      },
      pagination: {
        page: 1,
        per_page: 0,
        total: 0,
        visible: 10
      },
      headers: [
        { text: 'Time Ordered', value: 'created_at' },
        { text: 'Patient', value: 'patient' },
        { text: 'Specimen', value: 'specimen_id' },
        { text: 'Test', value: 'test_type' },
        { text: 'Visit', value: 'encounter' },
        { text: 'Status', value: 'test_status' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      tests: []
    }),

    computed: {

      length: function() {
        return Math.ceil(this.pagination.total / this.pagination.visible);
      },
    },

    watch: {
      showPDF (val) {
        val || this.close()
      },
      tests: {
        handler(val){
					this.testStatusColor(val)
        },
        deep: true
      }
    },

    created () {
      this.initialize()
    },

    mounted() {
      // Listen for the update-test-list event and its payload.
      EventBus.$on('update-test-list', data => {
        console.log('update-test-list')
        Object.assign(this.tests[this.editedIndex], data)
      });
    },

    methods: {
      close() {
        this.pdf_url = ''
      },
      loadingMethod(load, message="") {
        this.loadingDialog.loading = load;
        this.loadingDialog.message = message
      },

      filterStatus (statusID) {
				this.status_id = statusID
        let filteredData = []
        this.initialize()
        .then((data) => {
          if (!(statusID == 0)) {
            for (var i = 0; i < data.length; i++) {
              console.log(data[i]);
              if (data[i].test_status_id == statusID) {
                filteredData.push(data[i])
              }
            }
            this.tests = filteredData;
            console.log(filteredData);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      },

      async initialize () {

        this.loadingMethod(true, "Fetching All Tests")
        this.query = 'page='+ this.pagination.page;
        if (this.search != '') {
            this.query = '&search='+this.search;
        }

        let resp = null

        try {
          resp = await apiCall({url: '/api/test?' + this.query, method: 'GET' })
          console.log(resp);
          this.tests = resp.data;
          this.loadingMethod(false)
          this.pagination.per_page = resp.per_page;
          this.pagination.total = resp.total;
        } catch (error) {
          this.loadingMethod(false)
          console.log(error.response)
        }

        return resp.data
      },

      testStatusColor (data) {
				for (var i = 0; i < data.length; i++) {
					data[i]["status_color"] = this.checkStatus(data[i].test_status_id);
				}	
			},

      checkStatus (id) {
        if (id == 1) {
          // Pending
          return "#FF9800"
        }
        else if (id == 2) {
          // Started
          return "#2196F3"
        }
        else if (id == 3) {
          // Completed
          return "#2F0074"
        }
        else if (id == 4) {
          // Verified
          return "#4CAF50"
        }
        else {
          return ""
        }
      },

      getAge (birthday) {
          return ~~((Date.now() - Date.parse(birthday)) / (31557600000));
      },

      getGender (code) {
        if (code == 'male') {

          return 'M';
        }else if (code == 'female') {

          return 'F';
        }else{

          return '';
        }

          return ~~((Date.now() - Date.parse(birthday)) / (31557600000));
      },

      collectSpecimen (test) {
        this.editedIndex = this.tests.indexOf(test)
        this.$refs.specimenCollectionForm.modal(test);
      },

      start (test) {
        this.editedIndex = this.tests.indexOf(test)
        this.loadingMethod(false, "Starting Test")
        apiCall({url: '/api/test/start/' + test.id, method: 'GET' })
        .then(resp => {
          console.log(resp)
          Object.assign(this.tests[this.editedIndex], resp)
          this.loadingMethod(false)
          this.message = 'Test Started';
          this.snackbar = true;
        })
        .catch(error => {
          console.log(error.response)
          this.loadingMethod(false)
        })

      },

      verify (test) {
        this.editedIndex = this.tests.indexOf(test)
        this.loadingMethod(false, "Verifying Test")
        apiCall({url: '/api/test/verify/' + test.id, method: 'GET' })
        .then(resp => {
          console.log(resp)
          Object.assign(this.tests[this.editedIndex], resp)
          this.loadingMethod(false)
        })
        .catch(error => {
          console.log(error.response)
          this.loadingMethod(false)
        })
      },

      enterResults (test) {
        this.editedIndex = this.tests.indexOf(test)

        if (test.test_type.culture == 1) {
          this.$router.push({
            name:'TestCulture',
            params:{testId:test.id,measureId:test.test_type.measures[0].id}
          })
        }else{
          this.$refs.resultForm.modal(test);
        }
      },

      rejectSpecimen (test) {
        this.editedIndex = this.tests.indexOf(test)
        this.$refs.specimenRejectionForm.modal(test);
      },

      refer (test) {
        this.editedIndex = this.tests.indexOf(test)
        console.log(test);
        this.$refs.referralForm.modal(test);
      },

      detail (test) {
        this.$refs.testDetailForm.modal(test);
      },

      print (item) {
        console.log("Item is ",item)
        Vue.set(this,"pdf_url", process.env.VUE_APP_API_URL+'/print-tracker/'+item)
        Vue.set(this,"showPDF", true)

        // apiCall({url: '/print-tracker/'+item, method: 'GET',data:'PDF'})
        //   .then(resp => {
        //     console.log("PDF URL is ",this.pdf_url)
            
        //   })
        //   .catch(error => {
        //   console.log(error.response)
        // })
      },
      getPDF(id){
        console.log("Item is ",id)
        Vue.set(this,"pdf_url", process.env.VUE_APP_API_URL+this.url_prefix+"results/patient?pdf=true&id="+id)
        console.log("url is ",this.pdf_url)
        Vue.set(this,"showPDF", true)
      }
    }
  }
</script>
