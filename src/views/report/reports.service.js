import Vue from 'vue'
import {AppSettings} from "@/AppSettings";

export class ReportsService {

    static saveFolderReports(params) {
        return Vue.http.post(AppSettings.getUrl() + '/reports', params);
    }

    static getReports() {
        return Vue.http.get(AppSettings.getUrl() + '/reports');
    }

    static getReport(id) {
        return Vue.http.get(AppSettings.getUrl() + '/reports/' + id);
    }

    static importFile(formData) {
        return Vue.http.post(AppSettings.getUrl() + '/reports/import', formData);
    }

    static downloadFile(id, session_id) {
        return Vue.http.get(AppSettings.getUrl() + '/reports/download-excel/' + id + '/' + session_id, {responseType: 'blob'});
    }

    static deleteReport(id) {
        return Vue.http.delete(AppSettings.getUrl() + '/reports/' + id,);
    }

    static triggerDel(id) {
        return Vue.http.post(AppSettings.getUrl() + '/reports/trigger-del', {id})
    }
}
