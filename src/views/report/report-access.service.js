import Vue from 'vue'
import {AppSettings} from "@/AppSettings";

export class ReportAccessService {


    static getAccessByReport(id) {
        return Vue.http.get(AppSettings.getUrl() + '/report-access/by-report/' + id);
    }

    static saveAccess(params) {
        return Vue.http.post(AppSettings.getUrl() + '/report-access', params);
    }

}
