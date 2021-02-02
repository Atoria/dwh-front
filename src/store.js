import Vue from 'vue'
import Vuex from 'vuex'
import {AuthService} from "@/views/auth/auth.service";

Vue.use(Vuex)

const state = {
    sidebarShow: 'responsive',
    sidebarMinimize: false,
    userModal: {
        show: false,
        model: {
            first_name: null,
            last_name: null,
            email: null,
            role: null,
            password: null
        },
    },
    permissionModal: {
        show: false,
        model: {
            access: {},
            reportId: null
        }
    },
    reportModal: {
        show: false,
        model: {
            id: null,
            report_name: null,
            column_number: 0,
            report_select: null,
            report_descr: null,
            fields: []
        }
    },
    showUsersModal: false,
    users: []
}

const mutations = {
    set(state, [variable, value]) {
        state[variable] = value
    },
    showReportModal(state, payload) {
        console.log(payload);
        state.reportModal.model.fields = [];
        for (let i = 0; i < 10; i++) {
            state.reportModal.model.fields.push({field_type: 'number', field_name: '', field_default: ''})
        }

        if (payload) {
            state.reportModal.model = {
                ...state.reportModal.model,
                ...payload,
                column_number: payload.field_cnt
            }
            for (let i = 1; i <= 10; i++) {
                let obj = {
                    field_type: payload[`field${i}_type`],
                    field_name: payload[`field${i}_name`],
                    field_default: payload[`field${i}_default`]
                };
                state.reportModal.model.fields[i - 1] = obj
            }
        } else {
            state.reportModal.model = {
                ...state.reportModal.model,
                id: null,
                report_name: null,
                column_number: 0,
                report_select: null,
                report_descr: null
            }
        }

        state.reportModal.show = true;
    },
    hideReportModal(state) {
        state.reportModal.show = false;
    },
    showPermissionModal(state, payload) {
        state.permissionModal.model = {
            access: payload.access,
            reportId: payload.reportId
        }
        state.permissionModal.show = true;
    },
    hidePermissionModal(state) {
        state.permissionModal.show = false;
    },
    showUserModal(state, payload) {
        state.userModal.show = true;
        state.userModal.model = {
            first_name: null,
            last_name: null,
            email: null,
            role: null,
            password: null
        }
    },
    hideUserModal(state) {
        state.userModal.show = false;
    }
}


const actions = {
    getUsers({commit}, payload) {
        AuthService.getUsers().then((response) => {
            commit("set", ['users', response.body.data]);
        })

    }
}


export default new Vuex.Store({
    state,
    mutations,
    actions
})
