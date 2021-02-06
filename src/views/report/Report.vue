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
import {mapState} from "vuex";

export default {
  name: 'Report',
  data() {
    return {
      counter: 0,
      max: 100,
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
    ...mapState({
      isImporting: state => state.isImporting,
    }),
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
        this.$store.commit('set', ['isImporting', false])

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
  },
  methods: {
    abortImport() {
      this.disableAbort = true;
      ReportsService.abort(this.session_id).then((response) => {
        if (response.body.success) {
          this.$store.commit('set', ['isImporting', false])
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
      //HIDE EXCEL DATA WHEN NEW FILE IS IMPORTING
      this.$refs.excelData.total = 0;

      this.counter = 0;
      this.disableAbort = false;
      this.session_id = null;
      this.$store.commit('set', ['isImporting', true])
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
          this.$store.commit('set', ['isImporting', false])
          this.$toasted.error(response.body.error)
        }
      })
    },
    downloadReport() {
      if (!this.session_id) {
        this.$toasted.error('Can not find session')
        return;
      }
      this.$store.commit('set', ['isImporting', true])
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
    //GET CURRENT REPORT DATA
    ReportsService.getReport(this.$route.params.id).then((res) => {
      if (res.body.success) {
        this.report = res.body.data
      }
    })


    //CHECK IF NEW IMPORT IS IN PROGRESS
    ReportsService.getPendingImport({report_id: this.$route.params.id}).then((response) => {
      let pending = response.body.pending;
      this.$store.commit('set', ['isImporting', pending !== null])
      this.session_id = pending ? pending.SESSION_ID : null

      //FETCH LATEST IMPORTED FILE
      if (!pending) {
        ReportsService.getLatestComplete({report_id: this.$route.params.id}).then((response) => {
          if (response.body.complete) {
            this.session_id = response.body.complete.SESSION_ID;
            setTimeout(()=>{
              this.$refs.excelData.loadData();
            })
          }
        })
      }

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

