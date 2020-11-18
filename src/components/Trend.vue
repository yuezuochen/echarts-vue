  <!-- 销量趋势图表 -->
<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '👀' + showTitle}}</span>
      <span class="iconfont title-icon" @click="showChoice=!showChoice" :style="comStyle">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div class="select-item" v-for="item in selectTypes" :key='item.key' @click="handleSelect(item.key)">
          {{item.text}}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref">

    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false, // 是否显示可选项
      choiceType: "map", // 显示的数据类型
      titleFontSize: 0, // 指明标题文字的大小
    };
  },
  created() {
    // 在组件创建完成之后 进行回调函数的注册
    this.$socket.registerCallBack("trendData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    // 发送数据给服务器
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 在组件销毁之后 进行回调函数的取消
    this.$socket.unRegisterCallBack("trendData");
  },
  computed: {
    selectTypes() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType;
        });
      }
    },
    showTitle() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.choiceType].title;
      }
    },
    // 给标题设置样式
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize * 1.4 + "px",
      };
    },
    ...mapState(["theme"]),
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme);
      const initOption = {
        // 配置坐标轴位置
        grid: {
          top: "35%",
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
        tooltip: {
          trigger: "axis",
        },
        // 图例的位置
        legend: {
          left: 20,
          top: "15%",
          icon: "circle",
        },
      };
      this.chartInstance.setOption(initOption);
    },
    getData(res) {
      // const { data: res } = await this.$http.get("trend");
      this.allData = res;
      this.updateChart();
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      const timeArr = this.allData.common.month; // 类目轴
      const valueArr = this.allData[this.choiceType].data; // Y轴的数据 serier
      const seriesArr = valueArr.map((item, index) => {
        return {
          type: "line",
          data: item.data,
          name: item.name,
          stack: "map",
          areaStyle: {
            color: {
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colorArr1[index], // 0%处的颜色
                },
                {
                  offset: 1,
                  color: colorArr2[index], // 100%处的颜色
                },
              ],
            },
          },
        };
      });
      // 图例的数据
      const legendArr = valueArr.map((item) => {
        return item.name;
      });
      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    handleSelect(currentType) {
      this.choiceType = currentType;
      this.updateChart();
      this.showChoice = false;
    },
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
.title {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  color: white;
  user-select: none;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>