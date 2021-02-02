import Vue from 'vue'
import {AppSettings} from "@/AppSettings";

export class ExcelDataService {


    static getExcelData(params) {
        return Vue.http.get(AppSettings.getUrl() + '/excel-data', {params});
    }

    static updateRow(params) {
        return Vue.http.put(AppSettings.getUrl() + '/excel-data', params);
    }

}
