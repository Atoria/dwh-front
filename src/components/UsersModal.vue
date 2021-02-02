<template>
  <CModal
      size="lg"
      :closeOnBackdrop="false"
      :show.sync="showUsersModal"
  >
    <template v-slot:header>
      Users
    </template>

    <div class="col-sm-12" v-if="show">
      <CInput placeholder="Search User" v-model="search">
        <template #prepend-content>
          <CIcon name="cil-magnifying-glass"/>
        </template>
      </CInput>
      <hr>
      <div class="row mb-2" v-for="user of getUsers">
        <div class="col-sm-12">
          <CCard class="mb-0">
            <CCardHeader :class="getUserClass(user)">
              <p class="font-15 d-inline-block">{{ getUserName(user) }}</p>

              <div class="d-inline-block float-right">

                <CButton class="flex-grow-1 no-border"
                         :class="getUserClass(user)"
                         size="sm"
                         @click="deleteUser(user)"
                         v-c-tooltip="'Delete'">
                  <font-awesome-icon :icon="['fas', 'trash']"/>
                </CButton>

                <CButton class="flex-grow-1 no-border"
                         :class="getUserClass(user)"
                         size="sm"
                         @click="delFlag(user)"
                         v-c-tooltip="'Manage Flag'">
                  <span v-if="user.del_flag">
                     <font-awesome-icon :icon="['fas', 'unlock']"/>
                  </span>

                  <span v-if="!user.del_flag">
                     <font-awesome-icon :icon="['fas', 'lock']"/>
                  </span>
                </CButton>

                <CButton class="flex-grow-1 no-border"
                         :class="getUserClass(user)"
                         size="sm"
                         @click="toggleUser(user)"
                         v-c-tooltip="'Edit'">
                  <font-awesome-icon v-if="!user.accordion" :icon="['fas', 'arrow-down']"/>
                  <font-awesome-icon v-if="user.accordion" :icon="['fas', 'arrow-up']"/>
                </CButton>

              </div>


            </CCardHeader>


            <CCollapse :show="user.accordion">
              <CCardBody v-if="userUpdate[user.id]">

                <CForm>
                  <CRow>
                    <CCol md="6">
                      <CInput
                          v-model="userUpdate[user.id].first_name"
                          description="Enter User Firstname"
                          label="First Name"
                      />
                    </CCol>

                    <CCol md="6">
                      <CInput
                          v-model="userUpdate[user.id].last_name"
                          description="Enter User Lastname"
                          label="Last Name"
                      />
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md="6">
                      <CInput
                          v-model="userUpdate[user.id].email"
                          description="Enter User Email"
                          label="Email"
                      />
                    </CCol>

                    <CCol md="6">
                      <CSelect
                          :value.sync="userUpdate[user.id].role"
                          label="Report Color"
                          :options="['User','Admin', 'Developer']"
                          placeholder="Select User Role"
                      />
                    </CCol>
                  </CRow>

                  <CRow>

                    <CCol md="10">
                      <CInput
                          v-model="userUpdate[user.id].password"
                          description="Enter User Password"
                          label="Password"
                          :type="'password'"
                      />
                    </CCol>


                    <CCol md="2">
                      <CButton class="margin-top-28 float-right" color="success"
                               @click="updateUser(userUpdate[user.id])">Update
                      </CButton>
                    </CCol>

                  </CRow>


                </CForm>

              </CCardBody>
            </CCollapse>
          </CCard>
        </div>
        <hr>
      </div>

    </div>


    <template v-slot:footer>
      <CButton
          color="danger"
          @click="close"
      >Close
      </CButton>
    </template>
  </CModal>

</template>

<script>

import {AuthService} from "@/views/auth/auth.service";
import {mapState} from 'vuex'

export default {
  name: "UsersModal",
  data() {
    return {
      search: '',
      show: true,
      userUpdate: {}
    }
  },
  computed: {
    ...mapState({
      showUsersModal: state => state.showUsersModal,
      users: state => state.users
    }),
    getUsers() {
      this.show = false;
      let userData = JSON.parse(localStorage.getItem('user'))
      let currentUser = userData.user
      let usersCopy = JSON.parse(JSON.stringify(this.users));
      let returnData = usersCopy.map((user) => {
        user.accordion = false;
        return user
      }).filter((user) => {
        return user.id !== currentUser.id && (`${user.first_name} ${user.last_name}`.toLowerCase().includes(this.search.toLowerCase()))
      })

      this.show = true;
      return returnData;

    },
  },
  methods: {
    refreshView() {
      this.show = false;
      setTimeout(() => {
        this.show = true;
      })
    },
    close() {
      this.$store.commit('set', ['showUsersModal', false])
    },
    getUserName(user) {
      return user.first_name + " " + user.last_name;
    },
    toggleUser(user) {
      user.accordion = !user.accordion;
      if (user.accordion) {
        this.userUpdate[user.id] = {...user}
      }
      this.refreshView();
    },
    deleteUser(user) {
      AuthService.deleteUser(user.id).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Deleted Successfully')

          this.$store.dispatch('getUsers');
          // this.$store.commit('set', ['users', newUsers])
        } else {
          this.$toasted.error('Error Occured')
        }
      })
    },
    delFlag(user) {
      AuthService.triggerDel(user.id).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Updated Successfully')

          this.$store.dispatch('getUsers');
          // this.refreshView();
        } else {
          this.$toasted.error('Error Occured')
        }
      })
    },
    getUserClass(user) {
      return user.del_flag ? 'header-color-red' : 'header-color-grey'
    },
    updateUser(updateData) {
      console.log(updateData);
      AuthService.updateUser(updateData).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Updated Successfully')

          this.$store.dispatch('getUsers');
        } else {
          this.$toasted.error('Error Occurred')
        }
        console.log(response);
      })
    }
  },

}
</script>

<style scoped>
.mt-35px {
  margin-top: 35px;
}

.font-15 {
  font-size: 15px;
  margin-bottom: 0;
}

.header-color-grey {
  background-color: #636F83;
  color: white;
}

.header-color-red {
  background-color: #E55353;
  color: white;
}

.margin-top-28 {
  margin-top: 28px;
}

</style>
