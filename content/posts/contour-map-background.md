---
title: "给博客加一个每次访问都随机的等高线地形图背景"
date: 2026-09-18T15:30:00+08:00
draft: false
background: contour
tags: ["Hugo", "PaperMod", "JavaScript"]
summary: "用 simplex 噪声生成地形高度场，marching squares 提取等高线，纯前端渲染成 SVG——不依赖任何库，单文件 3.5KB，每次访问都是一张新地图。"
ShowToc: true
TocOpen: false
---

> **2026-10 & 2026-11 更新**：站点在 2026-10 曾短期换过一版[噪声毛玻璃背景](/posts/noise-glass-background/)；2026-11 前端重写为 Next.js 静态站点后，又用回了这套等高线算法，并加上了随滚动和光标移动的轻微视差。下文按最初 Hugo + PaperMod 版本的实现记录，完整的独立脚本附在文末。

## 动机

纯色背景看久了有点单调，我想给博客加上地形图那种一层一层的等高线，作为底层纹理淡淡地铺在后面。动手前先定了几个条件：用 SVG 矢量图保证任意分辨率下都清晰；每次刷新都随机生成一张新图，但窗口缩放时保持同一张地形；对比度压低，不影响正文阅读；不引第三方库，单文件搞定。

## 方案选择

「每次访问都随机」决定了具体做法。纯静态站点没有服务端，可选的路只有两条：

| 方案 | 做法 | 随机性 |
| --- | --- | --- |
| 客户端实时生成 | 浏览器里用 JS 生成噪声地形，实时提取等高线 | 无限变化，每次刷新都不一样 |
| 预生成 SVG 池 | 构建时生成 N 张 SVG，访问时随机挑一张 | 只在固定几张里轮换 |

我选了客户端实时生成。核心只有噪声场和 marching squares 两步，整个脚本两百多行就能写完，放到浏览器里现算并不重。

## 核心原理

整个流程分四步：

```
随机种子 → 噪声高度场 → 等高线提取 → SVG 渲染
```

### 1. 种子随机数：mulberry32

先写一个可复现的伪随机数生成器。等高线背景在窗口缩放时需要按新尺寸重绘，但地形不能跟着变成另一张图，所以随机性必须由统一种子驱动，不能直接散用 `Math.random()`：

```js
function mulberry32(seed) {
  var s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

页面加载时取一个新种子：`(Date.now() ^ ((Math.random() * 0xffffffff) | 0)) >>> 0`（先把随机数映射到 32 位整数再和时间戳异或，避免 JS 按位运算把 `0~1` 的小数直接截断成 `0`）。刷新页面换新图，窗口 resize 重绘时沿用同一种子，地形就能保持不变。

### 2. 地形高度场：simplex 噪声 + fBm

地形起伏得连续平缓，不能是杂乱的白噪点。2D simplex 噪声刚好能输出连续平滑的数值，再叠加 4 个倍频（fBm），把大尺度起伏和小尺度细节混在一起：

```js
function fbm(noise, x, y) {
  var v = 0, amp = 0.5, freq = 1, sum = 0;
  for (var o = 0; o < 4; o++) {
    v += amp * noise(x * freq, y * freq);
    sum += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / sum;
}
```

在按 9px 间距划分的网格上逐点采样，得到一个高度场数组，最后做两轮 3×3 均值平滑，让等高线拐弯更圆润。

### 3. 等高线提取：marching squares

对某个海拔阈值 `iso`（比如 `0.18`），逐格检查网格四个角的高度：高于 `iso` 记 1，低于记 0，四个角组成 16 种状态。每种状态对应等高线穿过这个格子的方式——比如只有左下角高于阈值，线就从左边穿入、底边穿出：

```js
// 边编号: 0=上 1=右 2=下 3=左
var CASES = {
  1:  [[3, 2]],  2:  [[2, 1]],  3:  [[3, 1]],
  4:  [[0, 1]],  6:  [[0, 2]],  7:  [[0, 3]],
  8:  [[0, 3]],  9:  [[0, 2]],  11: [[0, 1]],
  12: [[3, 1]],  13: [[2, 1]],  14: [[3, 2]]
};
```

交点的具体位置用线性插值求出，比如上边缘：

```js
if ((tl > iso) !== (tr > iso)) {
  pt[0] = [x + (iso - tl) / (tr - tl), y];
}
```

5 和 10 两个对角状态存在歧义（两个高点落在斜对角），取格子中心高度和 `iso` 比较来决定连法。把所有格子里的线段拼成一个 `<path>`，就是一层等高线。代码里取了 12 个海拔值（`-0.54` 到 `+0.54`，步长 `0.09`，跳过 `0`），过滤掉线段太少的零碎层级，最多得到 12 层嵌套的等高线。

### 4. SVG 渲染

每层等高线对应一个 `<path>`，放进一个固定定位的 `<svg>`：

```js
var svg = document.createElementNS(SVG_NS, 'svg');
svg.setAttribute('viewBox', '0 0 ' + data.width + ' ' + data.height);
svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
svg.setAttribute('aria-hidden', 'true');
```

`slice` 模式保证任何窗口比例下地图都能铺满屏幕。

## 样式与层叠细节

给背景层设 `z-index: -1` 时，按直觉可能会担心被 `body` 的纯色背景遮住。实际按照 CSS Backgrounds and Borders 规范，只要 `html` 本身没有背景且 `body` 没有创建独立的层叠上下文，浏览器就会把 `body` 的背景传播到最底层的根画布上，所以挂在 `body` 下且 `z-index: -1` 的 `<svg>` 依然能露出来。

```css
#contour-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  user-select: none;
}

#contour-bg path {
  fill: none;
  stroke: var(--secondary);
  stroke-width: 0.7;
  stroke-linecap: round;
  opacity: 0.15;
}

#contour-bg path.contour-index {
  stroke-width: 1;
  stroke-dasharray: 5 4;
  opacity: 0.25;
}

@media print {
  #contour-bg {
    display: none;
  }
}
```

配色和线型有两个小处理：

- 颜色直接借用主题的 `var(--secondary)`，PaperMod 在亮/暗模式下会重定义这个变量，深浅主题不用额外适配；透明度压到 `0.15`（计曲线 `0.25`），远低于正文文字，不影响阅读。
- 借用了地形图里每 5 级区分一条「计曲线」的做法——真实地形图里计曲线是加粗实线，这里为了背景视觉更轻，改成了稍粗的虚线，和其余细实线拉开层次。

## 成本

- 代码量：单文件 236 行，压缩后约 **3.5KB**，零依赖
- 耗时：桌面端 1440×800 视口生成 12 层等高线在十几毫秒内完成，手机端也没压力
- 没有网络请求、没有运行时依赖，构建产物只多一个 JS 文件和一个 CSS 文件

## 小结

整套效果只用了 `mulberry32`、2D simplex 噪声和 marching squares 三个基础模块，代码量不大，一次生成后就是静态 SVG，平时几乎不占额外性能。下面附上完整的 `contour-bg.js` 实现。

## 完整代码

```js
(function () {
  'use strict';

  function mulberry32(seed) {
    var s = seed | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise2D(rand) {
    var grad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) {
      var n = Math.floor(rand() * (i + 1));
      var q = p[i];
      p[i] = p[n];
      p[n] = q;
    }
    var perm = new Uint8Array(512);
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;
    return function (xin, yin) {
      var s = (xin + yin) * F2;
      var i0 = Math.floor(xin + s);
      var j0 = Math.floor(yin + s);
      var t = (i0 + j0) * G2;
      var x0 = xin - (i0 - t);
      var y0 = yin - (j0 - t);
      var i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
      var x1 = x0 - i1 + G2;
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2;
      var y2 = y0 - 1 + 2 * G2;
      var ii = i0 & 255;
      var jj = j0 & 255;
      var n0 = 0, n1 = 0, n2 = 0;
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var g0 = grad[perm[ii + perm[jj]] & 7];
        t0 *= t0;
        n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0);
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var g1 = grad[perm[ii + i1 + perm[jj + j1]] & 7];
        t1 *= t1;
        n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var g2 = grad[perm[ii + 1 + perm[jj + 1]] & 7];
        t2 *= t2;
        n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2);
      }
      return 70 * (n0 + n1 + n2);
    };
  }

  function fbm(noise, x, y) {
    var v = 0;
    var amp = 0.5;
    var freq = 1;
    var sum = 0;
    for (var o = 0; o < 4; o++) {
      v += amp * noise(x * freq, y * freq);
      sum += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return v / sum;
  }

  function smooth(src, cols, rows, passes) {
    var dst = new Float32Array(src.length);
    for (var p = 0; p < passes; p++) {
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var sum = 0;
          var n = 0;
          for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              var nx = x + dx;
              var ny = y + dy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                sum += src[ny * cols + nx];
                n++;
              }
            }
          }
          dst[y * cols + x] = sum / n;
        }
      }
      var tmp = src;
      src = dst;
      dst = tmp;
    }
    return src;
  }

  var CASES = {
    1: [[3, 2]],
    2: [[2, 1]],
    3: [[3, 1]],
    4: [[0, 1]],
    6: [[0, 2]],
    7: [[0, 3]],
    8: [[0, 3]],
    9: [[0, 2]],
    11: [[0, 1]],
    12: [[3, 1]],
    13: [[2, 1]],
    14: [[3, 2]]
  };

  function contourSegments(field, cols, rows, iso) {
    var segs = [];
    for (var y = 0; y < rows - 1; y++) {
      for (var x = 0; x < cols - 1; x++) {
        var tl = field[y * cols + x];
        var tr = field[y * cols + x + 1];
        var br = field[(y + 1) * cols + x + 1];
        var bl = field[(y + 1) * cols + x];
        var idx = (tl > iso ? 8 : 0) | (tr > iso ? 4 : 0) | (br > iso ? 2 : 0) | (bl > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        var pt = [null, null, null, null];
        if ((tl > iso) !== (tr > iso)) pt[0] = [x + (iso - tl) / (tr - tl), y];
        if ((tr > iso) !== (br > iso)) pt[1] = [x + 1, y + (iso - tr) / (br - tr)];
        if ((bl > iso) !== (br > iso)) pt[2] = [x + (iso - bl) / (br - bl), y + 1];
        if ((tl > iso) !== (bl > iso)) pt[3] = [x, y + (iso - tl) / (bl - tl)];
        var pairs;
        if (idx === 5 || idx === 10) {
          var center = (tl + tr + br + bl) / 4;
          if (idx === 5) pairs = (center > iso) ? [[0, 3], [1, 2]] : [[0, 1], [2, 3]];
          else pairs = (center > iso) ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]];
        } else {
          pairs = CASES[idx];
        }
        for (var k = 0; k < pairs.length; k++) {
          var a = pt[pairs[k][0]];
          var b = pt[pairs[k][1]];
          if (a && b) segs.push(a, b);
        }
      }
    }
    return segs;
  }

  function generateContours(width, height, seed) {
    var CELL = 9;
    var cols = Math.max(2, Math.ceil(width / CELL) + 1);
    var rows = Math.max(2, Math.ceil(height / CELL) + 1);
    var rand = mulberry32(seed);
    var noise = makeNoise2D(rand);
    var field = new Float32Array(cols * rows);
    var freq = 0.0016;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        field[y * cols + x] = fbm(noise, x * CELL * freq, y * CELL * freq);
      }
    }
    field = smooth(field, cols, rows, 2);
    var levels = [];
    for (var l = -6; l <= 6; l++) {
      if (l === 0) continue;
      levels.push(l * 0.09);
    }
    var paths = [];
    for (var i = 0; i < levels.length; i++) {
      var segs = contourSegments(field, cols, rows, levels[i]);
      if (segs.length < 8) continue;
      var d = '';
      for (var s = 0; s < segs.length; s += 2) {
        d += 'M' + (segs[s][0] * CELL).toFixed(1) + ' ' + (segs[s][1] * CELL).toFixed(1) +
          'L' + (segs[s + 1][0] * CELL).toFixed(1) + ' ' + (segs[s + 1][1] * CELL).toFixed(1);
      }
      paths.push({ d: d, index: i % 5 === 0 });
    }
    return { width: cols * CELL, height: rows * CELL, paths: paths };
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function buildSVG(data) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.id = 'contour-bg';
    svg.setAttribute('viewBox', '0 0 ' + data.width + ' ' + data.height);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    for (var i = 0; i < data.paths.length; i++) {
      var p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', data.paths[i].d);
      if (data.paths[i].index) p.setAttribute('class', 'contour-index');
      svg.appendChild(p);
    }
    return svg;
  }

  function init() {
    if (document.getElementById('contour-bg')) return;
    var seed = (Date.now() ^ ((Math.random() * 0xffffffff) | 0)) >>> 0;
    var svg = null;
    var timer = 0;
    function draw() {
      var data = generateContours(window.innerWidth, window.innerHeight, seed);
      var next = buildSVG(data);
      if (svg && svg.parentNode) svg.parentNode.replaceChild(next, svg);
      else document.body.appendChild(next);
      svg = next;
    }
    draw();
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(draw, 200);
    });
  }

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateContours: generateContours };
  }
})();
```
