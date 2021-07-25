import Vue from 'vue'
import VueGapi from 'vue-gapi'

Vue.use(VueGapi, {
    apiKey: process.env.GCP_API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    scope: 'https://www.googleapis.com/auth/youtube',
})
