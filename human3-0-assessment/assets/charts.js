/* Human3.0 能力评估系统 — 图表渲染（ECharts） */
window.H30Charts = (function () {
  'use strict';

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderRadar(elId, payload) {
    var el = document.getElementById(elId);
    if (!el || typeof echarts === 'undefined') return;

    var accent = css('--accent') || '#5b5ef4';
    var accent2 = css('--accent2') || '#9a55f5';
    var ink = css('--ink') || '#1a1e32';
    var muted = css('--muted') || '#5d6478';
    var rule = css('--rule') || '#e4e7f0';

    var chart = echarts.init(el, null, { renderer: 'svg' });

    var series = [
      {
        value: payload.current,
        name: '本轮评估',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: accent },
        itemStyle: { color: accent },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '55' },
              { offset: 1, color: accent2 + '44' }
            ]
          }
        },
        label: { show: true, color: ink, fontWeight: 600, fontSize: 11, formatter: function (p) { return p.value; } }
      }
    ];
    if (payload.previous) {
      series.push({
        value: payload.previous,
        name: '上一轮',
        symbolSize: 4,
        lineStyle: { width: 1.5, type: 'dashed', color: muted },
        itemStyle: { color: muted },
        areaStyle: { color: 'transparent' },
        label: { show: false }
      });
    }

    var option = {
      animationDuration: 700,
      color: [accent, muted],
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: '#ffffff',
        borderColor: rule,
        textStyle: { color: ink, fontSize: 12 }
      },
      legend: {
        bottom: 0,
        icon: 'roundRect',
        itemWidth: 14, itemHeight: 8,
        textStyle: { color: muted, fontSize: 12 },
        data: payload.previous ? ['本轮评估', '上一轮'] : ['本轮评估']
      },
      radar: {
        indicator: payload.labels.map(function (l) { return { name: l, max: 100 }; }),
        radius: '62%',
        center: ['50%', '48%'],
        splitNumber: 4,
        axisName: { color: ink, fontSize: 13, fontWeight: 700 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{ type: 'radar', data: series }]
    };

    chart.setOption(option);
    window.addEventListener('resize', function () { chart.resize(); });
    return chart;
  }

  return { renderRadar: renderRadar };
})();
