<template>
  <div v-if="report">

    <CCard v-if="isImporting">
      <CCardHeader>
        <h5 class="d-inline-block color-red mt-1 pt-2">{{ processType }}...</h5>
        <CButton color="danger" class="px-4 float-right mt-1" :disabled="disableAbort" @click="abortImport">Abort
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CProgress v-if="counter" :value="counter" :max="max" show-percentage animated
                   color="gradient-success"></CProgress>
        <vue-loaders-ball-pulse v-if="!counter" class="d-block text-center" scale="1" color="grey"/>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardHeader>
        <!--        <h5 class="d-inline-block mt-1 pt-2 red d-inline-block mr-1">Excel Sample Structure for: </h5>-->
        <h5 class="d-inline-block color-red mt-1 pt-2">{{ report.report_name }}</h5>


        <CButton color="dark" class="px-4 float-right mt-1" :disabled="isImporting" @click="importData">Import Excel
        </CButton>

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
import {AppSettings} from "@/AppSettings";

export default {
  name: 'Report',
  data() {
    return {
      counter: 0,
      max: 100,
      isImporting: true,
      disableAbort: false,
      report: null,
      processType: '',
      processTypes: {
        importing: 'Importing',
        generating: 'Generating'
      },
      session_id: null,
      imported: {},
    }
  },
  components: {
    ExcelData
  },
  computed: {
    getColor() {

      return '#636f83'
    }
  },
  sockets: {
    importStatus(data) {
      if (data.session === this.session_id) {
        this.counter = data.progress ? data.progress : 0;
        if (data.type) {
          this.processType = data.type;
        }
      }
    },
    importFinished(data) {
      if (data.session === this.session_id) {
        this.disableAbort = true;
        this.isImporting = false;

        console.log('FINISH');
        ReportsService.importComplete(this.session_id).then((response) => {
          console.log(response);
          if (response.body.success) {
            this.$refs.excelData.loadData();
            this.$toasted.success('Finished Import')
          } else {
            this.$toasted.error('Error Occurred')
          }
        })
      }
    },
    generatedSuccess(data) {
      this.isImporting = false;
      console.log('BUFFER', data);
      let bytes = new Uint8Array(data.buffer); // pass your byte response to this constructor
      let blob = new Blob([bytes], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});// change resultByte to bytes
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${this.report.report_name}.xlsx`;
      link.click();
    },

  },
  methods: {
    abortImport() {
      this.disableAbort = true;
      ReportsService.abort(this.session_id).then((response) => {
        if (response.body.success) {
          this.isImporting = false;
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
      this.counter = 0;
      this.disableAbort = false;
      this.session_id = null;
      this.isImporting = true;
      this.processType = this.processTypes.importing
      this.session_id = v4();
      let formData = new FormData();
      formData.append('file', event.target.files[0]);
      formData.append('report_id', this.$route.params.id)
      formData.append('session_id', this.session_id)
      ReportsService.importFile(formData).then((response) => {
        document.getElementById('fileUpload').value = '';
        if (response.body.success) {
          this.$toasted.success('Started Import')
        } else {
          this.session_id = null
          this.isImporting = false;
          this.$toasted.error(response.body.error)
        }
      })
    },
    downloadReport() {
      if (!this.session_id) {
        this.$toasted.error('Can not find session')
        return;
      }
      this.isImporting = true;
      this.processType = this.processTypes.generating;
      this.disableAbort = false;

      ReportsService.downloadFile(this.$route.params.id, this.session_id).then((res) => {
        if (res.body.success) {
          this.$toasted.success('Started Generation')
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

    ReportsService.getPendingImport({report_id: this.$route.params.id}).then((response) => {
      let pending = response.body.pending;
      this.isImporting = pending !== null;
      this.session_id = pending ? pending.SESSION_ID : null
      console.log(pending);
    })

  }
}
</script>


<style lang="scss">
.color-red {
  color: red;
}
</style>

