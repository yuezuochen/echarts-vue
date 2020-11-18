  <!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      chartData: null, // 服务器返回的数据
      currentPage: 1, // 当前显示的页数
      totalPage: 0, // 一共多少页
      timerId: null, // 定时器标识
    };
  },
  created() {
    this.$socket.registerCallBack("sellerData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    // 在页面加载完成时 调用页面监听函数
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timerId);
    // 组件销毁时候取消页面监听器
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unRegisterCallBack("sellerData", this.getData);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(
        this.$refs.seller_ref,
        this.theme
      );
      // 对图表进行初始化配置
      const initOption = {
        title: {
          text: "👀商家销售统计",
          left: 20,
          top: 20,
        },
        // 配置坐标轴位置
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true, // 开启距离包含坐标轴上面的文字
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0,
            lineStyle: {
              color: "#2d3443",
            },
          },
        },
        series: [
          {
            type: "bar",
            label: {
              show: true,
              position: "right",
              textStyle: {
                color: "white",
              },
            },
            itemStyle: {
              color: {
                // type: "linear", // 线性渐变
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#5052ee", // 0%处的颜色
                  },
                  {
                    offset: 1,
                    color: "#ab6ee5", // 100%处的颜色
                  },
                ],
              },
            },
          },
        ],
      };

      this.chartInstance.setOption(initOption);
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    // 获取服务器的数据
    getData(res) {
      // const { data: res } = await this.$http.get("seller");
      this.chartData = res;
      // 对数组进行排序
      this.chartData.sort((a, b) => {
        return a.value - b.value; // 从小到大
      });
      // 每5个元素显示一页
      this.totalPage =
        this.chartData.length % 5 === 0
          ? this.chartData.length / 5
          : this.chartData.length / 5 + 1;
      this.updateChart();
      this.startInterval();
    },
    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.chartData.slice(start, end);

      const sellerNames = showData.map((item) => {
        return item.name;
      });
      const sellerValues = showData.map((item) => {
        return item.value;
      });
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },

        series: [
          {
            data: sellerValues,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateChart();
      }, 3000);
    },
    // 图表自适应 当浏览器大小发生变化时调用
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          text: "👀商家销售统计",
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          // 背景色
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            // 每条柱的宽度
            barWidth: titleFontSize,
            itemStyle: {
              // 每条柱的边角 左上 右上 右下 左下
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      // 手动调用图表对象的resize
      this.chartInstance.resize();
    },
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      this.chartInstance.dispose(); // 销毁当前图表
      this.initChart(); // 以最新的主题初始化图表
      this.screenAdapter() // 完成屏幕的适配
      this.updateChart() // 更新图表的展示
    },
  },
};
</script>
<style lang="less" scoped>
</style>