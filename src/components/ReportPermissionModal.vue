<template>
  <CModal
      title="Manage Permissions"
      :close-on-backdrop="false"
      :show.sync="permissionModal.show"
  >

    <div class="col-sm-12" v-if="permissionModal.show">

      <CInput placeholder="Search User" v-model="search">
        <template #prepend-content>
          <CIcon name="cil-magnifying-glass"/>
        </template>
      </CInput>

      <hr>
      <div class="row mb-2" v-for="user of getUsers">
        <div class="col-sm-8">
          {{ getUserName(user) }}
        </div>
        <div class="col-sm-4">
          <CInputCheckbox @change="changePermission(user.id)"
                          :checked="permissionModal.model.access[user.id]"
                          class="text-center"/>
        </div>
        <hr>
      </div>

    </div>

    <template v-slot:footer>
      <CButton color="success" @click="save">Save</CButton>
      <CButton
          color="danger"
          @click="(value) => $store.commit('hidePermissionModal')"
      >Cancel
      </CButton>
    </template>

  </CModal>

</template>

<script>


import {ReportAccessService} from "@/views/report/report-access.service";
import {mapState} from "vuex";

export default {
  name: "ReportPermissionModal",
  props: ['permissionsData'],
  data() {
    return {
      search: ''
    }
  },
  computed: {
    ...mapState({
      permissionModal: state => state.permissionModal,
      users: state => state.users
    }),
    getUsers() {
      return this.users.filter((user) => {
            return user.role === 'User' && (`${user.first_name} ${user.last_name}`.toLowerCase().includes(this.search.toLowerCase()))
          }
      )
    },

  },
  methods: {
    getUserName(user) {
      return user.first_name + " " + user.last_name;
    },
    changePermission(id) {
      this.permissionModal.model.access[id] = !this.permissionModal.model.access[id]
    },
    save() {
      let permissions = [];
      for (let userId in this.permissionModal.model.access) {
        permissions.push({user: userId, access: this.permissionModal.model.access[userId]});
      }

      let params = {
        reportId: this.permissionModal.model.reportId,
        permissions: permissions
      }

      ReportAccessService.saveAccess(params).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Saved Successfully')
          this.$store.commit('hidePermissionModal')
        } else {
          this.$toasted.error('Error Occured')

        }
      })
    }
  }
}
</script>

<style scoped>
.mt-35px {
  margin-top: 35px;
}
</style>
