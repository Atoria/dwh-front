<template>
  <div class="c-app flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm>
                  <h1>Login</h1>
                  <p class="text-muted">Sign In to your account</p>
                  <CInput
                      v-model="email"
                      placeholder="Username"
                      autocomplete="username email"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-user"/>
                    </template>
                  </CInput>
                  <CInput
                      v-model="password"
                      placeholder="Password"
                      type="password"
                      autocomplete="curent-password"
                  >
                    <template #prepend-content>
                      <CIcon name="cil-lock-locked"/>
                    </template>
                  </CInput>
                  <CRow>
                    <CCol col="6" class="text-left">
                      <CButton color="danger" class="px-4" @click="login">Login</CButton>
                    </CCol>
                  </CRow>
                </CForm>
                <CAlert v-if="incorrect" show color="danger" class="mt-4">Incorrect email or password</CAlert>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>


import {AuthService} from "@/views/auth/auth.service.js";

export default {
  name: 'Login',
  data() {
    return {
      email: null,
      password: null,
      incorrect: false
    }
  },
  methods: {
    login() {
      let params = {
        email: this.email,
        password: this.password
      }
      AuthService.login(params).then((response) => {
        if (response.body.success) {
          localStorage.setItem('user', JSON.stringify({
            token: response.body.token,
            user: response.body.user
          }));
          this.$router.push('/dashboard')
        } else {
          this.incorrect = true;
        }

      });
    }
  },
  mounted() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.$router.push({name: 'Dashboard'})
    }
  }
}
</script>
