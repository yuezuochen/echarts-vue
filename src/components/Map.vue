<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>
<script>
import axios from "axios";
import { getProvinceMapInfo } from "@/utils/map_utils";
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      titleFontSize: null,
      mapData: {},
    };
  },
  created() {
    this.$socket.registerCallBack("mapData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("mapData", this.getData);
  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme);
      const { data: res } = await axios.get(
        "http://localhost:8080/static/map/china.json"
      );
      this.$echarts.registerMap("chinaMap", res);
      const initOption = {
        title: {
          text: "👀商家分布",
          left: 20,
          top: 20,
        },
        geo: {
          type: "map",
          map: "chinaMap",
          top: "5%",
          bottom: "5%",
          // 拖动缩放
          roam: true,
          // 名称显示
          label: {
            show: true,
            color: "white",
          },
          itemStyle: {
            areaColor: "#2172bf",
            borderColor: "#333",
          },
        },
        legend: {
          left: "5%",
          bottom: "5%",
          // 图例垂直效果
          orient: "vertical",
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("click", async (arg) => {
        const provinceInfo = getProvinceMapInfo(arg.name);
        if (!provinceInfo.key) return;
        // 判断当前点击省份地图矢量数据是否已存在
        if (!this.mapData[provinceInfo.key]) {
          const { data: res } = await axios.get(
            "http://localhost:8080" + provinceInfo.path
          );
          this.mapData[provinceInfo.key] = res;
          this.$echarts.registerMap(provinceInfo.key, res);
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        };
        this.chartInstance.setOption(changeOption);
      });
    },
    getData(res) {
      // const { data: res } = await this.$http.get("map");
      this.allData = res;
      this.updateChart();
    },
    updateChart() {
      const legendArr = this.allData.map((item) => {
        return item.name;
      });
      const seriesArr = this.allData.map((item) => {
        // 一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据,所有我们需要给散点的图表增加一个配置,coordinateSystem:geo
        return {
          type: "effectScatter",
          name: item.name,
          data: item.children,
          coordinateSystem: "geo",
          // 涟漪效果
          rippleEffect: {
            scale: 5,
            // 涟漪空心效果
            brushType: "stroke",
          },
        };
      });
      const dataOption = {
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    revertMap() {
      const revertOption = {
        geo: {
          map: "chinaMap",
        },
      };
      this.chartInstance.setOption(revertOption);
    },
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      this.chartInstance.dispose(); // 销毁当前图表
      this.initChart(); // 以最新的主题初始化图表
      this.screenAdapter(); // 完成屏幕的适配
      this.updateChart(); // 更新图表的展示
    },
  },
};
</script>
<style lang="less" scoped>
</style>