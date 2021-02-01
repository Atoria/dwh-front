<template>
  <div>
    <CCard>
      <CCardHeader>
        <div class="row">
          <div class="col-sm-4 offset-sm-4">
            <CInput placeholder="Search Report" v-model="search">
              <template #prepend-content>
                <CIcon name="cil-magnifying-glass"/>
              </template>
            </CInput>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol sm="6" md="4" v-for="report of getReports" v-bind:key="report.id">
            <CCard :color="getReportColor(report)" text-color="white" :class="{'pointer':!displayActionButtons}"
                   @click="navigate(report.id, true)">
              <p class="folder">{{ report.report_name }}</p>

              <div class="d-flex" v-if="displayActionButtons">
                <CButton class="flex-grow-1 no-border"
                         color="dark"
                         size="sm"
                         v-c-tooltip="'View'"
                         @click="navigate(report.id)">
                  <font-awesome-icon :icon="['fas', 'eye']"/>
                </CButton>

                <CButton class="flex-grow-1 no-border"
                         color="dark"
                         size="sm"
                         v-c-tooltip="'Edit'"
                         @click="edit(report)">
                  <font-awesome-icon :icon="['fas', 'pencil-alt']"/>

                </CButton>

                <CButton class="flex-grow-1 no-border"
                         color="dark"
                         size="sm"
                         v-c-tooltip="'Delete'"
                         @click="removeReport(report)">
                  <font-awesome-icon :icon="['fas', 'trash']"/>

                </CButton>


                <CButton class="flex-grow-1 no-border"
                         color="dark"
                         size="sm"
                         v-c-tooltip="'Manage Flag'"
                         @click="delFlag(report)">
                  <span v-if="report.del_flag">
                     <font-awesome-icon :icon="['fas', 'unlock']"/>
                  </span>

                  <span v-if="!report.del_flag">
                     <font-awesome-icon :icon="['fas', 'lock']"/>
                  </span>

                </CButton>

                <CButton class="flex-grow-1 no-border"
                         color="dark"
                         size="sm"
                         v-c-tooltip="'Permissions'"
                         @click="managePermission(report.id)">
                  <font-awesome-icon :icon="['fas', 'key']"/>
                </CButton>

              </div>

            </CCard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>


    <ReportPermissionModal></ReportPermissionModal>
    <report-modal/>


  </div>
</template>

<script>
import WidgetsDropdown from './widgets/WidgetsDropdown'
import WidgetsBrand from './widgets/WidgetsBrand'
import {ReportsService} from "@/views/report/reports.service";
import ReportPermissionModal from "@/components/ReportPermissionModal";
import {AuthService} from "@/views/auth/auth.service";
import {ReportAccessService} from "@/views/report/report-access.service";
import ReportModal from "@/components/ReportModal";

export default {
  name: 'Dashboard',
  components: {
    WidgetsDropdown,
    WidgetsBrand,
    ReportPermissionModal,
    ReportModal
  },
  data() {
    return {
      reports: [],
      search: '',
      permissionsData: {
        show: false,
        reportId: null,
        access: []
      },
      reportModel: {},
      showReportModal: false
    }
  },
  computed: {
    displayActionButtons() {
      let userData = JSON.parse(localStorage.getItem('user'))
      return userData.user.role !== 'User';
    },
    getReports() {
      return this.reports.filter((report) => report.report_name.toLowerCase().includes(this.search.toLowerCase()))
    }
  },
  methods: {
    edit(report) {
      this.$store.commit('showReportModal', report)

    },
    getReportColor(report) {
      return report.del_flag ? 'danger' : 'success'
    },
    color(value) {
      let $color
      if (value <= 25) {
        $color = 'info'
      } else if (value > 25 && value <= 50) {
        $color = 'success'
      } else if (value > 50 && value <= 75) {
        $color = 'warning'
      } else if (value > 75 && value <= 100) {
        $color = 'danger'
      }
      return $color
    },
    navigate(id, navigateFromCard = false) {
      if (navigateFromCard && this.displayActionButtons) {
        return;
      }
      this.$router.push({name: 'Report', params: {id: id}})
    },
    removeReport(report) {
      if (confirm(`Do you want to delete report ${report.report_name}?`)) {
        ReportsService.deleteReport(report.id).then((response) => {
          if (response.body.success) {
            this.getData();
          } else {
            //TODO TOASTER
          }
        })
      }
    },
    managePermission(id) {
      ReportAccessService.getAccessByReport(id).then((response) => {
        if (response.body.success) {
          this.$store.commit('showPermissionModal', {
            access: response.body.data,
            reportId: id
          })
          this.permissionsData.access = response.body.data;
          this.permissionsData.show = true;
          this.permissionsData.reportId = id;
        }
      })
    },
    getData() {
      ReportsService.getReports().then((response) => {
        if (response.body.success) {
          this.reports = response.body.data;
        }
      })
    },
    getUsers() {
      AuthService.getUsers().then((response) => {
        if (response.body.success) {
          this.$store.commit('set', ['users', response.body.data])
        }
      })
    },
    delFlag(report) {
      ReportsService.triggerDel(report.id).then((response) => {
        if (response.body.success) {
          report.del_flag = !report.del_flag
        } else {
          //TODO TOASTER
        }
      })
    }
  },
  mounted() {
    this.$store.dispatch('getUsers');
    // this.getUsers();
    this.getData();
  }
}
</script>

<style lang="scss">
.pointer {
  cursor: pointer;
}

.no-border {
  border-radius: 0;
  margin: 0 !important;
}
</style>
