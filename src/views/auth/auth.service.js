import Vue from 'vue'
import {AppSettings} from "@/AppSettings";

export class AuthService {

    static login(params) {
        return Vue.http.post(AppSettings.getUrl() + '/user/login', params);
    }

    static register(params) {
        return Vue.http.post(AppSettings.getUrl() + '/user/register', params);
    }

    static getUsers() {
        return Vue.http.get(AppSettings.getUrl() + '/user');
    }

    static updateUser(user) {
        return Vue.http.put(AppSettings.getUrl() + '/user', {user});
    }

    static deleteUser(id) {
        return Vue.http.delete(AppSettings.getUrl() + '/user/' + id,);
    }

    static triggerDel(id) {
        return Vue.http.post(AppSettings.getUrl() + '/user/trigger-del', {id})
    }

}
