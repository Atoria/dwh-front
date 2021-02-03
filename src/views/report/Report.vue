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
        size="sm"
        :closeOnBackdrop="false"
        :show.sync="showLoadingModal"
        class="loading-modal"
        id="import-modal-loader"
    >
      <template v-slot:header-wrapper>
        <span></span>
      </template>
      <template v-slot:body-wrapper>
        <div style="height: 150px">
          <div style="display: block; margin-left: 41%; margin-top: 70px">
            <span class="position-absolute mt-3 mr-1">{{ processType }}...</span>
            <vue-loaders-ball-scale-ripple scale="3" color="green"/>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="w-100" style="text-align: center">
          <hr>
          <CButton color="danger"
                   size="sm"
                   class="px-4"
                   :disabled="disableAbort"
                   @click="abortImport">Abort
          </CButton>
        </div>
      </template>
    </CModal>

    <excel-data ref="excelData"
                v-if="session_id"
                :session_id="session_id"
                :report="report"
                @generate-report="downloadReport"
    ></excel-data>

  </div>
</template>

<script>

import {ReportsService} from "@/views/report/reports.service";
import ExcelData from "@/views/report/excelData/ExcelData";
import {uuid} from 'uuidv4';
import {v4} from "uuid";

export default {
  name: 'Report',
  data() {
    return {
      tr: true,
      disableAbort: false,
      report: null,
      showLoadingModal: false,
      processType: '',
      processTypes: {
        importing: 'Importing',
        generating: 'Generating'
      },
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
    abortImport() {
      this.disableAbort = true;
      ReportsService.abort(this.session_id).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Process being aborted...')
        } else {
          this.$toasted.error('Error Occurred')
        }
      })

    },
    importData() {
      document.getElementById("fileUpload").click()
    },
    chooseFile(event) {
      this.disableAbort = false;
      this.session_id = null;
      this.showLoadingModal = true;
      this.processType = this.processTypes.importing
      this.session_id = v4();
      let formData = new FormData();
      formData.append('file', event.target.files[0]);
      formData.append('report_id', this.$route.params.id)
      formData.append('session_id', this.session_id)
      ReportsService.importFile(formData).then((response) => {
        document.getElementById('fileUpload').value = '';
        this.showLoadingModal = false;
        if (response.body.success) {
          this.$toasted.success('Imported Successfully')
          this.session_id = response.body.session_id;
          setTimeout(() => {
            this.$refs.excelData.loadData();
          })
        } else {
          this.session_id = null
          this.$toasted.error(response.body.error)
        }
      })
    },
    downloadReport() {
      if (!this.session_id) {
        this.$toasted.error('Can not find session')
        return;
      }
      this.showLoadingModal = true;
      this.processType = this.processTypes.generating;

      ReportsService.downloadFile(this.$route.params.id, this.session_id).then((res) => {
        this.showLoadingModal = false;
        if (res.body.success) {
          let bytes = new Uint8Array(res.body.buffer.data); // pass your byte response to this constructor
          let blob = new Blob([bytes], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});// change resultByte to bytes
          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `${this.report.report_name}.xlsx`;
          link.click();
        }
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

