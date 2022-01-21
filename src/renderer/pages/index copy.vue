<template>
  <div class="e-nuxt-container">
    <div class="e-nuxt-content">
      <div class="e-nuxt-logo">
        <img style="max-width: 100%" src="~assets/electron-nuxt.png">
      </div>
      <div class="e-nuxt-system-info">
        <system-information />
      </div>
      <div>
        <v-btn @click="runTest">Run autocannon</v-btn>
        <div>
          <apexchart
            width="500"
            type="bar"
            :options="options"
            :series="series"
          />
        </div>
      </div>
    </div>
    <div class="e-nuxt-links">
      <div
        class="e-nuxt-button"
        @click="openURL('https://github.com/michalzaq12/electron-nuxt')"
      >
        Github
      </div>
      <div class="e-nuxt-button" @click="openURL('https://nuxtjs.org/guide')">
        Nuxt.js
      </div>
      <div
        class="e-nuxt-button"
        @click="openURL('https://electronjs.org/docs')"
      >
        Electron.js
      </div>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import Vue from 'vue'
import SystemInformation from '@/components/SystemInformation.vue'
Vue.use(VueApexCharts)
const { ipcRenderer } = require('electron')

ipcRenderer.on('run-test-reply', (event, arg) => {
  console.log("run-test-reply front")
  console.log(arg) // prints "pong"
})

Vue.component('Apexchart', VueApexCharts)

export default {
  name: 'IndexPage',
  components: {
    SystemInformation
  },
  data () {
    return {
      externalContent: '',
      options: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        }
      },
      series: [
        {
          name: 'series-1',
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
      ]
    }
  },
  methods: {
    openURL (url) {
      window.open(url)
    },
    runTest (params) {
      params = {
        "a": 0,
        "b": 1
      }
      ipcRenderer.send('run-test', params)
    }
  }
}
</script>

<style>
.e-nuxt-container {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to right, #ece9e6, #ffffff);
  font-family: Helvetica, sans-serif;
}

.e-nuxt-content {
  display: flex;
  justify-content: space-around;
  padding-top: 100px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.e-nuxt-logo {
  width: 400px;
}

.e-nuxt-system-info {
  padding: 20px;
  border-top: 1px solid #397c6d;
  border-bottom: 1px solid #397c6d;
}

.e-nuxt-links {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.e-nuxt-button {
  color: #364758;
  padding: 5px 20px;
  border: 1px solid #397c6d;
  margin: 0 20px;
  border-radius: 15px;
  font-size: 1rem;
}

.e-nuxt-button:hover {
  cursor: pointer;
  color: white;
  background-color: #397c6d;
}
</style>
