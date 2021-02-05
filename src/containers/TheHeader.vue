<template>
  <CHeader fixed with-subheader class="dwh-header">
    <CHeaderBrand class="mx-auto d-lg-none" to="/">
      <!--      <CIcon name="logo" height="48" alt="Logo"/>-->
    </CHeaderBrand>
    <CHeaderNav class="d-md-down-none mr-auto">
      <b @click="navigateHome()" style="cursor: pointer; color: white" class="ml-4 pt-3"><p>{{ getUsername }}</p></b>

    </CHeaderNav>
    <CHeaderNav class="mr-4">
      <CButton color="dark" class="px-4 mr-3" @click="displayUsersModal" v-if="showAddUser">Users</CButton>
      <CButton color="dark" class="px-4 mr-3" @click="displayUserModal" v-if="showAddUser">Add User</CButton>
      <CButton color="dark" class="px-4 mr-3" @click="displayModal" v-if="showAddReport">Add Report</CButton>
      <CButton color="danger" class="px-4" @click="logout">Logout</CButton>
    </CHeaderNav>


    <report-modal/>
    <user-modal/>
    <users-modal/>

  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'
import ReportModal from "@/components/ReportModal";
import {ReportsService} from "@/views/report/reports.service";
import UserModal from "@/components/UserModal";
import UsersModal from "@/components/UsersModal";

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt, ReportModal, UserModal, UsersModal
  },
  data() {
    return {}
  },
  computed: {
    getUsername() {
      let user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        return ''
      }
      return user.user.first_name + ' ' + user.user.last_name;
    },
    showAddUser() {
      let user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        return false
      }
      user = user.user
      return user.role === 'Admin'
    },
    showAddReport() {
      let user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        return false
      }
      user = user.user
      return user.role === 'Admin' || user.role === 'Developer'
    },
  },
  methods: {
    logout() {
      this.$socket.disconnect();
      localStorage.removeItem('user');
      this.$router.push('/auth/login')
    },
    displayUserModal() {
      this.$store.commit('showUserModal')
    },
    displayModal() {
      this.$store.commit('showReportModal')
    },
    displayUsersModal() {
      this.$store.commit('set', ['showUsersModal', true])
    },
    navigateHome() {
      if (this.$route.name !== 'Dashboard') {
        this.$router.push({name: 'Dashboard'})
      }
    }
  },
}
</script>

<style lang="scss">

.dwh-header {
  background-color: #636F83;
  height: 80px;
  //color: white;
}

.red-line {
  border: 1px solid black;
}

</style>
