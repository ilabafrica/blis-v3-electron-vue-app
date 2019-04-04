<template>
  <div>
    <v-card class="ma-1">
        <v-img
          class="white--text"
          height="200px"
          :src="home_url+'/storage/profile_pictures/'+organization.logo"
        >
          <v-container fluid style="background: linear-gradient(to bottom, rgb(75,0,130, 0.1), rgba(75,0,130,0.9)); position: absolute; bottom: 0px; height: 10px">
            <v-layout>
              <v-flex xs12 align-end flexbox>
                <p class="text-xs-center title">{{organization.name}}</p>
              </v-flex>
            </v-layout>
          </v-container>
        </v-img>
      
    </v-card>
    <v-list dense>
      <v-list-tile to="/">
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-title >Home</v-list-tile-title>
      </v-list-tile>
      <v-list-tile to="/patients/patient" v-if="$can('manage_patients')">
        <v-list-tile-action>
          <v-icon>assignment_ind</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Patients</v-list-tile-title>
      </v-list-tile>
      <v-list-group prepend-icon="settings" no-action  v-if="$can('manage_configurations')">
        <v-list-tile slot="activator">
          <v-list-tile-title>Lab Configuration</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(lab_configuration, i) in lab_configurations" :key="i"
          :to="{path:lab_configuration.path}">
          <v-list-tile-action>
            <v-icon v-text="lab_configuration.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="lab_configuration.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-group prepend-icon="assignment" no-action  v-if="$can('manage_test_catalog')">
        <v-list-tile slot="activator">
          <v-list-tile-title>Test Catalog</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(test_catalog, i) in test_catalogs" :key="i"
          :to="{path:test_catalog.path}">
          <v-list-tile-action>
            <v-icon v-text="test_catalog.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="test_catalog.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-group prepend-icon="security" no-action v-if="$can('manage_users')" >
        <v-list-tile slot="activator">
          <v-list-tile-title>Access Control</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(access_control, i) in access_controls" :key="i"
          :to="{path:access_control.path}">
          <v-list-tile-action>
            <v-icon v-text="access_control.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="access_control.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-tile to="/encounter/index" >
        <v-list-tile-action>
          <v-icon>directions_walk</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
            Visits
        </v-list-tile-title>
      </v-list-tile>
      <v-list-tile to="/test/index" v-if="$can('edit_test_result')" >
        <v-list-tile-action>
          <v-icon>settings_input_component</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
            Tests
        </v-list-tile-title>
      </v-list-tile>
      <v-list-group prepend-icon="sync_problem" no-action  v-if="$can('manage_quality_control')">
        <v-list-tile slot="activator">
          <v-list-tile-title>Quality Controls</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(quality_control, i) in quality_control" :key="i" :to="{path:quality_control.path}">
          <v-list-tile-action>
            <v-icon v-text="quality_control.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="quality_control.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-group prepend-icon="line_weight" no-action v-if="$can('manage_inventory')">
        <v-list-tile slot="activator">
          <v-list-tile-title>Inventory</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(inventory, i) in inventory" :key="i" :to="{path:inventory.path}">
          <v-list-tile-action>
            <v-icon v-text="inventory.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="inventory.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-group prepend-icon="assessment" no-action>
        <v-list-tile slot="activator">
          <v-list-tile-title>Statistics</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(stat, i) in stats" :key="i" :to="{path:stat.path}">
          <v-list-tile-action>
            <v-icon v-text="stat.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="stat.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
      <v-list-group prepend-icon="dashboard" no-action>
        <v-list-tile slot="activator">
          <v-list-tile-title>Reports</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(report, i) in reports" :key="i" :to="{path:report.path}">
          <v-list-tile-action>
            <v-icon v-text="report.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-title v-text="report.label"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { USER_REQUEST } from '../store/actions/user'
  import apiCall from '../utils/api'

  export default {
    name: 'Sidebar',
    data: () => ({
      user: {},
      organization: [],
      lab_configurations: [
        {
          path: '/labconfiguration/generalconfiguration',
          label: 'General',
          icon: 'build'
        },
        {
          path: '/labconfiguration/healthunit',
          label: 'Health Units',
          icon: 'add_circle'
        },
        {
          path: '/labconfiguration/organization',
          label: 'Facility',
          icon: 'domain'
        },
        {
          path: '/labconfiguration/interfacedequipment',
          label: 'Interfaced Equipment',
          icon: 'devices'
        },
      ],
      test_catalogs: [
        {
          path: '/testcatalog/testtypecategory',
          label: 'Lab Sections',
          icon: 'dashboard'
        },
        {
          path: '/testcatalog/specimentype',
          label: 'Specimen Types',
          icon: 'assignment_turned_in'
        },
        {
          path: '/testcatalog/specimenrejectionreason',
          label: 'Rejection Reason',
          icon: 'assignment_late'
        },
        {
          path: '/testcatalog/testtype',
          label: 'Test Types',
          icon: 'extension'
        },
        {
          path: '/testcatalog/antibiotic',
          label: 'Antibiotics',
          icon: 'opacity'
        }
      ],
      access_controls: [
        {
          path: '/accesscontrol/thirdpartyapps',
          label: 'Third Party Apps',
          icon: 'extension'
        },
        {
          path: '/accesscontrol/useraccounts',
          label: 'User Accounts',
          icon: 'people'
        },
        {
          path: '/accesscontrol/permissions',
          label: 'Permissions',
          icon: 'visibility'
        },
        {
          path: '/accesscontrol/role',
          label: 'Role',
          icon: 'contacts'
        },
        {
          path: '/accesscontrol/roleusers',
          label: 'Assign Roles',
          icon: 'verified_user'
        },
      ],
      quality_control: [
        {
          path: '/qualitycontrol/lot',
          label: 'Lots',
          icon: 'layers'
        },
        {
          path: '/qualitycontrol/controltest',
          label: 'Tests',
          icon: 'settings_input_component'
        },
      ],
      inventory: [
        {
          path: '/inventory/supplier',
          label: 'Suppliers',
          icon: 'folder'
        },
        {
          path: '/inventory/item',
          label: 'Items',
          icon: 'widgets'
        },
        {
          path: '/inventory/request',
          label: 'Requests',
          icon: 'launch'
        },
      ],
      stats: [
        {
          path: '/stats/users',
          label: 'User Stats',
          icon: 'people'
        },
        {
          path: '/stats/tests',
          label: 'Test Stats',
          icon: 'dashboard'
        },
        {
          path: '/stats/tests/type',
          label: 'Test Type',
          icon: 'layers'
        },
        {
          path: '/stats/specimen',
          label: 'Specimen Stats',
          icon: 'assignment_turned_in'
        },
      ],
      reports: [
        {
          path: '/reports/infection',
          label: 'Infection Report',
          icon: 'assignment_turned_in'
        },
        {
          path: '/reports/patients',
          label: 'Patients',
          icon: 'people'
        },
      ]
    }),

    mounted: function () {
      if (this.$store.getters.isAuthenticated) {
        this.$store.dispatch(USER_REQUEST)
        
      }
    },
    methods: {
      initialize() {
      }
    },
    computed: {
      ...mapGetters(['getProfile', 'isAuthenticated', 'isProfileLoaded']),
      ...mapState({
        authLoading: state => state.auth.status === 'loading',
        home_url:()=>{
          return process.env.VUE_APP_API_URL
        }
        
      })
    },
    created() {
      this.initialize();
    }
  }
</script>

