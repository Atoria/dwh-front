<template>
  <CModal
      title="Add Report"
      size="lg"
      :closeOnBackdrop="false"
      :show.sync="reportModal.show"
  >
    <CForm>
      <CRow>
        <CCol md="12">
          <CInput
              v-model="reportModal.model.report_name"
              description="Fill New Report Name."
              label="Report Name"
          />
        </CCol>

        <CCol md="12">

          <CSelect
              @change=""
              :value.sync="reportModal.model.column_number"
              label="Column Number"
              :options="[1,2,3,4,5,6,7,8,9,10]"
              placeholder="Select Column Number"
          />
        </CCol>

        <CCol md="12">
          <CTextarea
              v-model="reportModal.model.report_select"
              label="Report Select"
              placeholder="Fill Report Select"
              rows="9"
          />
        </CCol>

      </CRow>


      <template>

        <hr v-if="reportModal.model.column_number" class="red-line"/>

        <template v-for="i in reportModal.model.column_number">
          <CRow>
            <CCol md="4">
              <CSelect
                  :value.sync="reportModal.model.fields[i-1][`field_type`]"
                  :label="`Field Type ${i}`"
                  :options="['number', 'date','text']"
              />
            </CCol>

            <CCol md="4">
              <CInput
                  v-model="reportModal.model.fields[i-1][`field_name`]"
                  :label="`Field Name ${i}`"
              />
            </CCol>

            <CCol md="4">
              <CInput
                  v-model="reportModal.model.fields[i-1][`field_default`]"
                  :label="`Field Default ${i}`"
              />
            </CCol>

          </CRow>
        </template>

      </template>


    </CForm>

    <CAlert v-if="hasErrors" show color="danger" class="mt-4">{{ error }}</CAlert>

    <template v-slot:footer>
      <CButton color="primary" @click="save">Save</CButton>
      <CButton
          color="secondary"
          @click="(value) => $store.commit('hideReportModal')"
      >Cancel
      </CButton>
    </template>


  </CModal>


</template>

<script>
import {ReportsService} from "@/views/report/reports.service";
import {mapState} from "vuex";

export default {
  name: "ReportModal",
  data() {
    return {
      hasErrors: false,
      error: null,
      folderColors: [
        {value: 'primary', label: 'Blue'},
        {value: 'secondary', label: 'Grey'},
        {value: 'success', label: 'Green'},
        {value: 'danger', label: 'Red'},
        {value: 'warning', label: 'Yellow'},
        {value: 'info', label: 'Light blue'},
      ],

    }
  },
  computed: {
    ...mapState({
      reportModal: state => state.reportModal,
    })
  },
  methods: {
    isValid() {
      let isGeneralFieldsSet = this.reportModal.model.column_number > 0 && this.reportModal.model.report_select && this.reportModal.model.report_select.length > 0;
      let isFieldNamesSet = true;
      for (let i = 0; i < this.reportModal.model.column_number; i++) {
        if (!this.reportModal.model.fields[i].field_name || this.reportModal.model.fields[i].field_name.length === 0) {
          isFieldNamesSet = false;
        }
      }

      return isGeneralFieldsSet && isFieldNamesSet;
    },
    save() {
      this.hasErrors = false;
      this.error = '';

      if (!this.isValid()) {
        this.hasErrors = true;
        this.error = 'Please Fill All Fields'
        return;
      }

      let params = JSON.parse(JSON.stringify(this.reportModal.model));

      ReportsService.saveFolderReports(params).then((response) => {
        if (response.body.success) {
          this.$store.commit('hideReportModal')
          this.$router.push({name: 'Report', params: {id: response.body.data.id}})
        } else {
          this.error = 'Error Occurred on Save';
        }
      })
    },
    setChecked() {
      this.reportModal.model.existing = !this.reportModal.model.existing;
      this.reportModal.model.existing_folder = null;
    },

  }
}
</script>

<style scoped>
.mt-35px {
  margin-top: 35px;
}
</style>
