<template>
  <div class="com-container">
    <div class="com-chart" ref="screen_ref">
    </div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentIndex: 0,
      titleFontSize: null,
    };
  },
  computed: {
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    ...mapState(["theme"]),
  },
  created() {
    this.$socket.registerCallBack("hotproductData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "hotproductData",
      chartName: "hotproduct",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("hotproductData", this.getData);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(
        this.$refs.screen_ref,
        this.theme
      );
      const initOption = {
        title: {
          text: "👀热销商品销售金额占比统计",
          left: 20,
          top: 20,
        },
        legend: {
          top: "15%",
          // 图例图标显示为圆形
          icon: "circle",
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children;
            // 计算出所有三级分类的数值总和
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });
            let retStr = "";
            thirdCategory.forEach((item) => {
              retStr += `
              ${item.name}:${parseInt((item.value / total) * 100)}%<br/>
              `;
            });
            return retStr;
          },
        },
        series: [
          {
            type: "pie",
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                // show: false,
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
    },
    getData(res) {
      // const { data: res } = await this.$http.get("/hotproduct");
      this.allData = res;
      this.updateChart();
    },
    updateChart() {
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => {
          return item.name;
        }
      );
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.screen_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            radius: [this.titleFontSize * 3.5, this.titleFontSize * 5], // 圆环  第一个为内圆的半径  第二个为外圆的半径
            center: ["50%", "60%"],
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
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
span {
  color: white;
  user-select: none;
}
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
}
</style>