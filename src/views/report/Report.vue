<template>
  <div v-if="report">

    <CCard>
      <CCardHeader>
        <!--        <h5 class="d-inline-block mt-1 pt-2 red d-inline-block mr-1">Excel Sample Structure for: </h5>-->
        <h5 class="d-inline-block color-red mt-1 pt-2">{{ report.report_name }}</h5>


        <CButton color="dark" class="px-4 float-right mt-1" @click="importData">Import Excel</CButton>

      </CCardHeader>
      <CCardBody>
        <input id="fileUpload" type="file" @change="chooseFile" hidden>


        <div v-if="report.report_descr">
          <h5>Report Description:</h5>
          <p> {{ report.report_descr }}</p>
          <hr>
        </div>

        <h5>Excel Sample Structure:</h5>

        <table class="table table-striped table-bordered" style="width: auto">
          <thead>
          <tr>
            <template v-for="i in report.field_cnt">
              <th :style="{'background-color': getColor}" style="color: white;" scope="col">{{
                  report[`field${i}_name`]
                }}
              </th>
            </template>


          </tr>
          </thead>
          <tbody>
          <tr>
            <template v-for="i in report.field_cnt">

              <td>{{
                  report[`field${i}_type`] + ' ' + (report[`field${i}_default`] ? ' (' + report[`field${i}_default`] + ')' : '')
                }}
              </td>
            </template>

          </tr>
          </tbody>
        </table>
      </CCardBody>
    </CCard>


    <CModal
        :title="processType"
        size="sm"
        :closeOnBackdrop="false"
        :show.sync="showLoadingModal"
        class="loading-modal"
    >
      <template v-slot:body-wrapper>
        <div style="height: 150px">
          <div style="display: block; margin-left: 45%; margin-top: 50px">
            <vue-loaders-ball-scale-ripple scale="2" color="red"/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <span></span>
      </template>
    </CModal>

    <excel-data ref="excelData" v-if="session_id" :session_id="session_id" :report="report"></excel-data>

  </div>
</template>

<script>

import {ReportsService} from "@/views/report/reports.service";
import ExcelData from "@/views/report/excelData/ExcelData";

export default {
  name: 'Report',
  data() {
    return {
      report: null,
      showLoadingModal: false,
      processType: '',
      session_id: null,
      imported: {}
    }
  },
  components: {
    ExcelData
  },
  computed: {
    getColor() {
      // if (this.report.report_color === 'primary') {
      //   return '#321fdb'
      // } else if (this.report.report_color === 'secondary') {
      //   return '#6c757d'
      // } else if (this.report.report_color === 'success') {
      //   return '#28a745'
      // } else if (this.report.report_color === 'danger') {
      //   return '#dc3545'
      // } else if (this.report.report_color === 'warning') {
      //   return '#ffc107'
      // } else if (this.report.report_color === 'info') {
      //   return '#17a2b8'
      // }
      return '#636f83'
    }
  },
  methods: {
    importData() {
      document.getElementById("fileUpload").click()
    },
    chooseFile(event) {
      this.session_id = null;
      this.showLoadingModal = true;
      this.processType = 'Importing'
      let formData = new FormData();
      formData.append('file', event.target.files[0]);
      formData.append('report_id', this.$route.params.id)
      ReportsService.importFile(formData).then((response) => {
        document.getElementById('fileUpload').value = '';
        this.showLoadingModal = false;
        this.$toasted.success('Imported Successfully')

        if (response.body.success) {
          this.session_id = response.body.session_id;
          setTimeout(() => {
            this.$refs.excelData.loadData();
          })
        } else {
          this.$toasted.error('Error Occured')
        }
      })
    },
    downloadReport() {
      if (!this.session_id) {
        this.$toasted.error('Can not find session')
        return;
      }
      ReportsService.downloadFile(this.$route.params.id, this.session_id).then((res) => {
        this.showLoadingModal = false;
        let bytes = new Uint8Array(res.body.buffer.data); // pass your byte response to this constructor
        let blob = new Blob([bytes], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});// change resultByte to bytes
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${this.report.report_name}.xlsx`;
        link.click();
      })
    },
  },
  mounted() {
    ReportsService.getReport(this.$route.params.id).then((res) => {
      if (res.body.success) {
        this.report = res.body.data
      }
    })
  },
  beforeRouteLeave: function (to, from, next) {
    if (!this.showLoadingModal) {
      return next()
    }
    if (confirm('Loading is in progress do you wish to abond?')) {
      return next();
    }
    return next(false)
  }
}
</script>


<style lang="scss">
.color-red {
  color: red;
}
</style>

