<template>
  <CModal
      title="Add User"
      size="lg"
      :closeOnBackdrop="false"
      :show.sync="userModal.show"
  >
    <CForm>
      <CRow>
        <CCol md="6">
          <CInput
              v-model="userModal.model.first_name"
              description="Enter User Firstname"
              label="First Name"
          />
        </CCol>

        <CCol md="6">
          <CInput
              v-model="userModal.model.last_name"
              description="Enter User Lastname"
              label="Last Name"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol md="6">
          <CInput
              v-model="userModal.model.email"
              description="Enter User Email"
              label="Email"
          />
        </CCol>

        <CCol md="6">
          <CSelect
              :value.sync="userModal.model.role"
              label="Report Color"
              :options="['User','Admin']"
              placeholder="Select User Role"
          />
        </CCol>
      </CRow>

      <CRow>

        <CCol md="12">
          <CInput
              v-model="userModal.model.password"
              description="Enter User Password"
              label="Password"
              :type="'password'"
          />
        </CCol>

      </CRow>


    </CForm>

    <CAlert v-if="hasErrors" show color="danger" class="mt-4">{{ error }}</CAlert>

    <template v-slot:footer>
      <CButton color="primary" @click="save">Save</CButton>
      <CButton
          color="secondary"
          @click="(value) => $store.commit('hideUserModal')"
      >Cancel
      </CButton>
    </template>
  </CModal>

</template>

<script>

import {AuthService} from "@/views/auth/auth.service";
import {mapState} from 'vuex'

export default {
  name: "UserModal",
  data() {
    return {
      hasErrors: false,
      error: null,
      model: {
        first_name: null,
        last_name: null,
        email: null,
        role: null,
        password: null
      },

    }
  },
  computed: mapState({
    userModal: state => state.userModal,
  }),
  methods: {
    test() {
      console.log(111);
    },
    isValid() {
      return this.userModal.model.first_name &&
          this.userModal.model.last_name &&
          this.userModal.model.email &&
          this.userModal.model.role &&
          this.userModal.model.password
    },
    save() {
      this.hasErrors = false;
      this.error = '';

      if (!this.isValid()) {
        console.log(1111);
        this.hasErrors = true;
        this.error = 'Please Fill All Fields'
        return;
      }

      AuthService.register(this.userModal.model).then((response) => {
        if (response.body.success) {
          this.$store.commit('hideUserModal')
        } else {
          this.hasErrors = true;
          this.error = 'User can not be saved';
        }
      })

    },
  }
}
</script>

<style scoped>
.mt-35px {
  margin-top: 35px;
}
</style>
