import { VueGapi } from 'vue-gapi'


let $gapi: VueGapi

export function initializeGapi(gapiInstance: VueGapi) {
  $gapi = gapiInstance
}

export { $gapi }
