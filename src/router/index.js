import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import Login from '../components/login'
import Home from '../components/home'
import Sidebar from '../components/sidebar'
import Patient from '../components/patients/patient'
import HealthUnit from '../components/labconfiguration/healthunit'
import Organization from '../components/labconfiguration/organization'
import InterfacedEquipment from '../components/labconfiguration/interfacedequipment'
import TestTypeCategory from '../components/testcatalog/testtypecategory'
import SpecimenType from '../components/testcatalog/specimentype'
import TestType from '../components/testcatalog/testtype/index'
import Measure from '../components/testcatalog/testtype/measure'
import SpecimenRejectionReason from '../components/testcatalog/specimenrejectionreason'
import Antibiotic from '../components/testcatalog/testtype/antibiotic'
import UserAccounts from '../components/accesscontrol/useraccounts'
import Permissions from '../components/accesscontrol/permissions'
import Role from '../components/accesscontrol/role'
import RoleUser from '../components/accesscontrol/roleusers'
import Test from '../components/test/index'
import Encounter from '../components/encounter/index'
import Lot from '../components/qualitycontrol/lot'
import Stats from '../components/statistics/system/index'
import UserStats from '../components/statistics/users/index'
import UserStatsSingle from '../components/statistics/users/single'
import TestStats from '../components/statistics/tests/index'
import SpecimenStats from '../components/statistics/specimen/index'
import TestStatsSearch from '../components/statistics/tests/search'
import TestStatsType from '../components/statistics/tests/type'
import InfectionReport from '../components/reports/infection'
import PatientReport from '../components/reports/patient/index'
import PatientReportSingle from '../components/reports/patient/single'
import ControlTest from '../components/qualitycontrol/controltest'
import Profile from '../components/account/profile'
import InventoryItem from '../components/inventory/item'
import InventoryRequest from '../components/inventory/request'
import InventorySupplier from '../components/inventory/supplier'


Vue.use(Router)

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next()
    return
  }
    next('/')
}

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next()
    return
  }
  next('/login')
}

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      beforeEnter: ifNotAuthenticated,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/sidebar',
      name: 'SideBar',
      component: Sidebar,
    },
    {
      path: '/patients/patient',
      name: 'Patient',
      component: Patient,
      beforeEnter: ifAuthenticated,
    },
    // User Profile
    {
      path: '/account/profile',
      name: 'Profile',
      component: Profile,
      beforeEnter: ifAuthenticated,
    },
    // Lab Configurations
    {
      path: '/labconfiguration/healthunit',
      name: 'HealthUnit',
      component: HealthUnit,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/labconfiguration/organization',
      name: 'Organization',
      component: Organization,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/labconfiguration/interfacedequipment',
      name: 'InterfacedEquipment',
      component: InterfacedEquipment,
      beforeEnter: ifAuthenticated,
    },
    // Test Catalog
    {
      path: '/testcatalog/testtypecategory',
      name: 'LabSection',
      component: TestTypeCategory,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/testcatalog/specimentype',
      name: 'SpecimenType',
      component: SpecimenType,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/testcatalog/testtype',
      name: 'TestType',
      component: TestType,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/testcatalog/measures/:id/',
      name: 'Measure',
      component: Measure,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/testcatalog/specimenrejectionreason',
      name: 'RejectionReason',
      component: SpecimenRejectionReason,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/testcatalog/antibiotic',
      name: 'Antibiotic',
      component: Antibiotic,
      beforeEnter: ifAuthenticated,
    },
    // Access Control
    {
      path: '/accesscontrol/useraccounts',
      name: 'UserAccount',
      component: UserAccounts,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/accesscontrol/permissions',
      name: 'Permission',
      component: Permissions,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/accesscontrol/role',
      name: 'Role',
      component: Role,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/accesscontrol/roleusers',
      name: 'RoleUser',
      component: RoleUser,
      beforeEnter: ifAuthenticated,
    },
    //Routine and Reference Testing
    {
      path: '/test/index',
      name: 'Test',
      component: Test,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/encounter/index',
      name: 'Encounter',
      component: Encounter,
      beforeEnter: ifAuthenticated,
    },
    //Quality Control
    {
      path: '/qualitycontrol/lot',
      name: 'Lot',
      component: Lot,
      beforeEnter: ifAuthenticated,
    },
    //Inventory
    {
      path: '/inventory/supplier',
      name: 'Supplier',
      component: InventorySupplier,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/inventory/item',
      name: 'Item',
      component: InventoryItem,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/inventory/request',
      name: 'Request',
      component: InventoryRequest,
      beforeEnter: ifAuthenticated,
    },
    // General Stats
    {
      path: '/stats/',
      name: 'Stats',
      component: Stats,
      beforeEnter: ifAuthenticated,
    },
    //All Users Stats
    {
      path: '/stats/users',
      name: 'user_stats',
      component: UserStats,
      beforeEnter: ifAuthenticated,
    },
    //Single User Stats
    {
      path: '/stats/users/:id',
      name: 'single_user_stats',
      component: UserStatsSingle,
      beforeEnter: ifAuthenticated,
    },
    //All Tests Stats
    {
      path: '/stats/tests',
      name: 'tests_stats',
      component: TestStats,
      beforeEnter: ifAuthenticated,
    },
    //All Specimen Stats
    {
      path: '/stats/specimen',
      name: 'specimen_stats',
      component: SpecimenStats,
    },
    //Search Tests Stats
    {
      path: '/stats/tests/search',
      name: 'tests_stats_search',
      component: TestStatsSearch,
      beforeEnter: ifAuthenticated,
    },
    //Search Tests Stats
    {
      path: '/stats/tests/type',
      name: 'tests_stats_type',
      component: TestStatsType,
      beforeEnter: ifAuthenticated,
    },
    //Reports
    {
      path: '/reports/infection',
      name: 'infection_report',
      component: InfectionReport,
      beforeEnter: ifAuthenticated,
    },
    //Patient Reports
    {
      path: '/reports/patients',
      name: 'patient_reports',
      component: PatientReport,
      beforeEnter: ifAuthenticated,
    },
    //Patient Reports
    {
      path: '/reports/patients/:id',
      name: 'patient_reports_single',
      component: PatientReportSingle,
      beforeEnter: ifAuthenticated,
    },
    {
      path: '/qualitycontrol/controltest',
      name: 'ControlTest',
      component: ControlTest,
      beforeEnter: ifAuthenticated,
    },
  ],
})
