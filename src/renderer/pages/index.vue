<template>
  <v-container class="mainContainer">
    <v-row>
      <v-col cols="4">
        <v-row>
          <v-col>
            <v-form v-model="valid">
              <v-card outlined height="550px">
                <!-- <v-card-title>Parameters</v-card-title> -->
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="params.title"
                        :disabled="blockAll"
                        label="Test name"
                        placeholder="New test"
                        outlined
                        :rules="nameRules"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="params.url"
                        :disabled="blockAll"
                        label="Url"
                        placeholder="Url"
                        outlined
                        :rules="urlRules"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="params.connections"
                        :disabled="blockAll"
                        label="Number of connections"
                        outlined
                        :rules="connectionsRules"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="params.duration"
                        :disabled="!lockAmount || blockAll"
                        label="Duration [s]"
                        outlined
                        :value="lockAmount ? params.duration : '1'"
                        :append-icon="lockAmount ? 'mdi-close' : 'mdi-close'"
                        :rules="durationRules"
                        @click:append="lockAmount = !lockAmount"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="params.amount"
                        :disabled="lockAmount || blockAll"
                        label="Amount of requests"
                        outlined
                        :value="lockAmount ? '1' : params.amount"
                        :append-icon="lockAmount ? 'mdi-close' : 'mdi-close'"
                        :rules="amountRules"
                        @click:append="lockAmount = !lockAmount"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="params.workers"
                        :disabled="blockAll"
                        label="Number of Workers"
                        outlined
                        :rules="workersRules"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="9">
                      <v-btn
                        id="runBtn"
                        :disabled="blockAll || !valid"
                        color="blue"
                        class="white--text"
                        @click="runTest"
                      >
                        Run test
                      </v-btn>

                      <v-btn
                        :disabled="!blockAll"
                        color="red"
                        class="white--text"
                        @click="stopTest"
                      >
                        Stop test
                      </v-btn>
                    </v-col>
                    <v-col cols="3">
                      <div class="timerContainer">
                        <div class="timer">{{ time }} s</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-form>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-card id="chartCard" outlined height="550px">
          <v-tabs v-model="tab">
            <v-tab>Latency [ms]</v-tab>
            <v-tab>Request number [req/sec]</v-tab>
            <v-tab>Throughput [bytes/sec]</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-card>
                <apexchart
                  type="scatter"
                  :options="latencyOptions"
                  :series="latencySeries"
                />
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card>
                <apexchart
                  type="scatter"
                  :options="requestsOptions"
                  :series="requestsSeries"
                />
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card>
                <apexchart
                  type="scatter"
                  :options="throughputOptions"
                  :series="throughputSeries"
                />
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card outlined>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="tests"
            class="elevation-1"
            item-key="_id"
            show-select
            height="600px"
          >
            <template #top>
              <v-toolbar flat>
                <v-toolbar-title>Tests</v-toolbar-title>
                <v-divider class="mx-4" inset vertical />
                <v-spacer />
                <v-btn
                  raised
                  outlined
                  text
                  color="red"
                  class="white--text"
                  :disabled="!tests.length"
                  @click="deleteAllTests"
                >
                  Delete all tests
                </v-btn>
              </v-toolbar>
            </template>
            <template #header="">
              <thead>
                <tr>
                  <th colspan="1" />
                  <th colspan="6">Parameters</th>
                  <th colspan="3">Latency [ms]</th>
                  <th colspan="3">Requests [req/sec]</th>
                  <th colspan="3">Throughput [bytes/sec]</th>
                </tr>
              </thead>
            </template>
            <template #[`item.actions`]="{ item }">
              <v-icon small @click="deleteTest(item)"> mdi-delete </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import Vue from "vue";
import VueTimers from "vue-timers";
import SystemInformation from "@/components/SystemInformation.vue";
const db = require("diskdb");
Vue.use(VueApexCharts);
const { ipcRenderer } = require("electron");
Vue.component("Apexchart", VueApexCharts);
Vue.use(VueTimers);

export default {
  name: "IndexPage",
  components: {
    SystemInformation,
  },
  data() {
    return {
      valid: true,
      selected: [],
      alreadyShown: [],
      tab: null,
      props: [],
      time: 0,
      lockAmount: false,
      blockAll: false,
      params: {
        title: "New test",
        url: "localhost:3000",
        connections: 10,
        duration: 10,
        amount: 10,
        workers: 1,
      },
      db: "",
      headers: [
        {
          text: "Test title",
          align: "start",
          sortable: false,
          value: "title",
        },
        { text: "Url", value: "url" },
        { text: "Date", value: "start" },
        { text: "Duration [s]", value: "duration" },
        { text: "Connections", value: "connections" },
        { text: "Requests", value: "requests.sent" },
        { text: "Workers", value: "workers" },
        { text: "Average", value: "latency.average" },
        { text: "Mean", value: "latency.p50" },
        { text: "Stdev", value: "latency.stddev" },
        { text: "Average", value: "requests.average" },
        { text: "Mean", value: "requests.p50" },
        { text: "Stdev", value: "requests.stddev" },
        { text: "Average", value: "throughput.average" },
        { text: "Mean", value: "throughput.p50" },
        { text: "Stdev", value: "throughput.stddev" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      tests: [],
      externalContent: "",
      latencyOptions: {
        toolbar: {
          show: true,
        },
        chart: {
          id: "latency-chart",
        },
        xaxis: {
          title: {
            text: "Percentiles",
          },
          categories: [
            "0.001%",
            "0.01%",
            "0.1%",
            "1%",
            "2.5%",
            "10%",
            "25%",
            "50%",
            "75%",
            "90%",
            "97.5%",
            "99%",
            "99.9%",
            "99.99%",
            "99.999%",
          ],
          axisBorder: {
            show: true,
            color: "#78909C",
            height: 1,
            width: "100%",
            offsetX: 0,
            offsetY: 0,
          },
        },
        yaxis: {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: "#78909C",
          },
          title: {
            text: "Latency [ms]",
          },
        },
        grid: {
          show: true,
          borderColor: "#90A4AE",
          strokeDashArray: 2,
          position: "back",
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          row: {
            opacity: 1,
          },
          column: {
            opacity: 1,
          },
        },
      },
      latencySeries: [],
      requestsOptions: {
        toolbar: {
          show: true,
        },
        chart: {
          id: "requests-chart",
        },
        xaxis: {
          categories: [
            "0.001%",
            "0.01%",
            "0.1%",
            "1%",
            "2.5%",
            "10%",
            "25%",
            "50%",
            "75%",
            "90%",
            "97.5%",
            "99%",
            "99.9%",
            "99.99%",
            "99.999%",
          ],
          axisBorder: {
            show: true,
            color: "#78909C",
            height: 1,
            width: "100%",
            offsetX: 0,
            offsetY: 0,
          },
          title: {
            text: "Percentiles",
          },
        },
        yaxis: {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: "#78909C",
          },
          title: {
            text: "Number of requests [req/sec]",
          },
        },
        grid: {
          show: true,
          borderColor: "#90A4AE",
          strokeDashArray: 2,
          position: "back",
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          row: {
            opacity: 1,
          },
          column: {
            opacity: 1,
          },
        },
      },
      requestsSeries: [],
      throughputOptions: {
        toolbar: {
          show: true,
        },
        chart: {
          id: "throughput-chart",
        },
        xaxis: {
          categories: [
            "0.001%",
            "0.01%",
            "0.1%",
            "1%",
            "2.5%",
            "10%",
            "25%",
            "50%",
            "75%",
            "90%",
            "97.5%",
            "99%",
            "99.9%",
            "99.99%",
            "99.999%",
          ],
          axisBorder: {
            show: true,
            color: "#78909C",
            height: 1,
            width: "100%",
            offsetX: 0,
            offsetY: 0,
          },
          title: {
            text: "Percentiles",
          },
        },
        yaxis: {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: true,
            color: "#78909C",
          },
          title: {
            text: "Throughput [bytes/sec]",
          },
        },
        grid: {
          show: true,
          borderColor: "#90A4AE",
          strokeDashArray: 2,
          position: "back",
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          row: {
            opacity: 1,
          },
          column: {
            opacity: 1,
          },
        },
      },
      throughputSeries: [],
      nameRules: [(v) => !!v || "This field is required"],
      urlRules: [(v) => !!v || "This field is required"],
      connectionsRules: [
        (v) => !!v || "This field is required",
        (v) => (v && v >= 0) || "Number of connections should be above 0",
        (v) =>
          (v && v <= 2000) || "Number of connections should not be above 2000",
      ],
      durationRules: [
        // (v) => !!v || "This field is required",
        (v) => (v && v >= 0) || "Duration should be above 0s",
        (v) => (v && v <= 300) || "Duration should not be above 300s",
      ],
      amountRules: [
        // (v) => !!v || "This field is required",
        (v) => (v && v >= 0) || "Number of requests should be above 0",
        (v) =>
          (v && v <= 2000) || "Number of requests should not be above 2000",
      ],
      workersRules: [
        (v) => !!v || "This field is required",
        (v) => (v && v >= 0) || "Number of workers should be above 0",
        (v) => (v && v <= 20) || "Number of workers should not be above 20",
      ],
    };
  },
  timers: {
    log: { time: 1000, repeat: true, immediate: false },
  },
  watch: {
    selected(val) {
      console.log(val);
      for (const index in val) {
        const test = val[index];
        if (!this.alreadyShown.includes(test)) {
          this.showTest(test);
          this.alreadyShown.push(test);
        }
      }
      let i = this.alreadyShown.length;
      while (i--) {
        const test = this.alreadyShown[i];
        if (!val.includes(test)) {
          this.deleteTestFromCharts(test);
          this.alreadyShown.splice(i, 1);
        }
      }
    },
  },
  mounted() {
    this.db = db.connect("./db/", ["tests"]);
    this.tests = db.tests.find();
    ipcRenderer.on("run-test-reply", (event, result) => {
      result.workers = this.params.workers;
      this.db.tests.save(result);
      this.tests.push(result);
      console.log(this.tests);
      console.log("test saved");
      this.blockAll = false;
      this.$timer.stop("log");
      this.selected.push(result);
    });
    ipcRenderer.on("stop-test-reply", (event, result) => {
      if (result) {
        this.blockAll = false;
        this.$timer.stop("log");
      }
    });
  },
  methods: {
    deleteAllTests() {
      this.db.tests.remove();
      this.db = db.connect("./db/", ["tests"]);
      this.tests = db.tests.find();
      this.selected = [];
      // this.alreadyShown.length = 0
    },
    deleteTestFromCharts(test) {
      let target = this.latencySeries.find((x) => x._id === test._id);
      this.latencySeries.splice(this.latencySeries.indexOf(target), 1);

      target = this.requestsSeries.find((x) => x._id === test._id);
      this.requestsSeries.splice(this.requestsSeries.indexOf(target), 1);

      target = this.throughputSeries.find((x) => x._id === test._id);
      this.throughputSeries.splice(this.throughputSeries.indexOf(target), 1);
    },
    deleteTest(test) {
      console.log(test);
      this.db.tests.remove({ _id: test._id });
      this.tests.splice(this.tests.indexOf(test), 1);
      this.selected.splice(this.tests.indexOf(test), 1);
      this.alreadyShown.splice(this.tests.indexOf(test), 1);
      this.deleteTestFromCharts(test);
    },
    showTest(test) {
      const latencySeries = {
        _id: test._id,
        name: test.title,
        data: [],
      };
      for (const property in test.latency) {
        if (property.includes("p")) {
          latencySeries.data.push(test.latency[property]);
        }
      }
      this.latencySeries.push(latencySeries);

      const requestsSeries = {
        _id: test._id,
        name: test.title,
        data: [],
      };
      for (const property in test.requests) {
        if (property.includes("p")) {
          requestsSeries.data.push(test.requests[property]);
        }
      }
      this.requestsSeries.push(requestsSeries);

      const throughputSeries = {
        _id: test._id,
        name: test.title,
        data: [],
      };
      for (const property in test.throughput) {
        if (property.includes("p")) {
          throughputSeries.data.push(test.throughput[property]);
        }
      }
      this.throughputSeries.push(throughputSeries);
    },
    log() {
      this.time += 1;
    },
    openURL(url) {
      window.open(url);
    },
    runTest() {
      this.blockAll = true;
      const params = Object.assign({}, this.params);
      console.log(params);
      if (this.lockAmount) {
        delete params.amount;
      } else {
        delete params.duration;
      }
      ipcRenderer.send("run-test", params);
      // this.timers.start('log')
      this.time = 0;
      this.$timer.start("log");
    },
    stopTest() {
      ipcRenderer.send("stop-test");
    },
  },
};
</script>

<style>
#runBtn {
  margin-right: 20px;
}

.timerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-bottom: 1px solid grey;
  /* border-radius: 5px; */
}

.timer {
  font-size: 18px;
  font-weight: 500;
}

.container {
  margin-top: 15px;
}

#chartCard {
  /* border-width: 1px !important; */
  /* border-color: grey !important; */
}

.mainContainer {
  max-width: 1200px;
}
</style>
