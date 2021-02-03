<template>
  <div v-if="total > 0 ">
    <div id="bla">
      <div id="blo"></div>
    </div>
    <CCard>
      <CCardHeader>
        <h5 class="d-inline-block color-red mt-1 pt-2">{{ report.report_name }}</h5>


        <CButton color="dark" class="px-4 float-right mt-1" @click="generateReport">Generate Report</CButton>

      </CCardHeader>

      <CCardBody>

        <div style="display: block; margin-left: 45%;" v-if="loading">
          <vue-loaders-ball-scale-ripple scale="1" color="red"/>
        </div>

        <table class="table table-striped table-bordered" @click="tableClickListener" v-if="!loading">
          <thead>
          <tr>
            <th :style="{'background-color': getColor}" style="color: white;" scope="col" v-for="index in 10">
              {{ header[`FIELD${index}_VALUE`] !== null ? header[`FIELD${index}_VALUE`] : 'NULL' }}
            </th>
          </tr>

          </thead>
          <tbody>
          <tr v-for="item in data">
            <td v-for="index in 10">
              <p :key="`VIEW-${item.ID}-${index}`" :id="`VIEW-${item.ID}-${index}`" v-if="!item._EDITING"
                 @click="enableEditing(item)">
                {{ item[`FIELD${index}_VALUE`] }} </p>
              <CInput :key="`EDIT-${item.ID}-${index}`"
                      :id="`EDIT-${item.ID}-${index}`"
                      v-if="item._EDITING"
                      v-model=" item[`FIELD${index}_VALUE`]"
                      @update:value="updatedValue($event, item)"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </CCardBody>

      <CCardFooter v-if="!loading ">
        <CPagination
            @update:activePage="pageChanged"
            :activePage.sync="currentPage"
            :pages="pages"
            size="lg"
            align="center"
        />
      </CCardFooter>
    </CCard>

  </div>
</template>

<script>


import {ExcelDataService} from "@/views/report/excelData/excel-data.service";

export default {
  name: 'Report',
  props: ['session_id', 'report'],
  data() {
    return {
      data: [],
      total: 0,
      perPage: 50,
      currentPage: 1,
      pages: 0,
      header: [],
      loading: false,
      clickedTable: false
    }
  },
  computed: {
    getColor() {
      return '#636f83'
    }
  },
  methods: {
    generateReport() {
      this.$emit('generate-report')
    },
    tableClickListener() {
      this.clickedTable = true;
    },
    enableEditing(item) {
      console.log('aaa');
      item._EDITING = true
    },
    updatedValue(changed, item) {
      ExcelDataService.updateRow(item).then((response) => {
        if (response.body.success) {
          this.$toasted.success('Row Updated Successfully')
        } else {
          this.$toasted.error('Error Occured')
        }
      })
    },
    loadData(page = 1) {
      if (page === 1) {
        this.currentPage = 1;
      }

      let params = {
        limit: this.perPage,
        offset: (this.currentPage - 1) * this.perPage,
        session_id: this.session_id
      }
      this.loading = true;

      ExcelDataService.getExcelData(params).then((response) => {
        if (response.body.success) {
          this.data = response.body.data;
          this.total = response.body.total;
          this.header = response.body.header;
          this.pages = Math.ceil(this.total / this.perPage)
          this.loading = false;
        }
      })

    },

    pageChanged(event) {
      this.currentPage = event;
      this.loadData(this.currentPage);
    }
  },
  mounted() {
    let vm = this;
    document.addEventListener('click', (event) => {
      if (!vm.clickedTable) {
        vm.data = vm.data.map((elem) => {
          elem._EDITING = false;
          return elem;
        })
      }
      vm.clickedTable = false;


      return true
    })

  }

}
</script>


<style lang="scss">
.color-red {
  color: red;
}
</style>

