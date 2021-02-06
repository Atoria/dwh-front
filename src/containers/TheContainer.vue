<template>
  <div class="c-app">
    <CWrapper>
      <TheHeader/>
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition name="fade" mode="out-in">
              <router-view :key="$route.path"></router-view>
            </transition>
          </CContainer>
        </main>
      </div>
      <!--      <TheFooter/>-->
    </CWrapper>
  </div>
</template>

<script>
import TheSidebar from './TheSidebar'
import TheHeader from './TheHeader'
import TheFooter from './TheFooter'

export default {
  name: 'TheContainer',
  components: {
    TheSidebar,
    TheHeader,
    TheFooter
  },
  sockets:{
    generatedSuccess(data) {
      this.$store.commit('set', ['isImporting', false])
      console.log('BUFFER', data);
      let bytes = new Uint8Array(data.buffer); // pass your byte response to this constructor
      let blob = new Blob([bytes], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});// change resultByte to bytes
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${data.report_name}.xlsx`;
      link.click();
    },
  },
  mounted() {
    this.$socket.connect()
    let userData = JSON.parse(localStorage.getItem('user'))
    if (!userData) {
      this.$router.push({name: 'Login'})
    }
  }
}
</script>

<style lang="scss">
.loading-modal {
  .modal-footer {
    border-top: 0 !important;
  }
}

</style>

<style scoped>


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
