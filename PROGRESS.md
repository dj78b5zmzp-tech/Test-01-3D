# 项目进度存档

> 最后更新：2026-05-17
> 项目：**3D 钢筋平法可视化**（React + Vite + react-three-fiber + Tailwind + Leva）

---

## 一、项目目标

构建一个浏览器端的 3D 钢筋构造可视化工具，支持**梁 / 柱 / 板**三种构件，能交互式调整尺寸、配筋、显示锚固/搭接/弯钩等专业构造细节，并输出下料表与 3D 模型（GLTF/STL）。

---

## 二、技术栈

- **构建**：Vite 5 + React 18 + TypeScript
- **3D**：three.js + @react-three/fiber + @react-three/drei
- **样式**：TailwindCSS（暗色主题）
- **参数面板**：leva
- **导出**：three/examples/jsm exporters (GLTFExporter, STLExporter)
- **场景单位**：内部 mm，渲染层 `<group scale={0.001}>` 缩放到 m

启动命令：
```powershell
cd f:\AIsaibotumu\Test-1
npm run dev    # http://localhost:5173/
npm run build  # 生产构建
npx tsc -b     # 类型检查
```

---

## 三、已完成功能清单（✅）

### 1. 基础架构
- ✅ 项目脚手架（Vite + TS + Tailwind + leva + r3f）
- ✅ 暗色 UI（顶栏 + 左下图例 + 右下下料表 + 右侧 Leva 参数面板）

### 2. 梁构件
- ✅ 矩形截面混凝土（可调透明度）
- ✅ 上部纵筋、下部纵筋、腰筋、箍筋
- ✅ 剖面切割（沿 X 方向 clipping plane）
- ✅ 标注（上下纵筋、箍筋、腰筋、尺寸、锚固方式）
- ✅ **梁两端柱状混凝土支座**（hc × bc，顶/底可独立伸出）
- ✅ **箍筋 135° 抗震双弯钩**（平直段 max(10d, 75mm)，两钩在角点错位 0.6d）
- ✅ **纵筋锚固**：自动判断直锚（La ≤ hc-cover）/ 弯锚（90° + 15d 弯钩，上向下、下向上）
- ✅ **搭接**：超过定尺（默认 9000mm）按 Ll = 1.4·La 自动分段，下料表计入

### 3. 柱构件
- ✅ 矩形截面、周圈布筋（countX × countZ 自动去重）
- ✅ 沿柱高的箍筋阵列
- ✅ 截面/纵筋/箍筋三类标注

### 4. 板构件
- ✅ 长方板（lengthX × lengthZ × thickness）
- ✅ 底筋双向（X/Z）、可选面筋双向
- ✅ 按间距自动计算根数与位置

### 5. 交互
- ✅ OrbitControls：左键旋转 / 右键平移 / 滚轮缩放
- ✅ GizmoHelper 三轴指示
- ✅ **钢筋拾取与高亮**：点击钢筋，emissive 黄色发光，顶栏徽章显示钢筋 ID（如 `TM-1`、`ST-23`）

### 6. 钢筋视觉
- ✅ **程序化螺纹法线贴图**（Canvas 绘制 2 条纵肋 + 14 排错开月牙肋，RGB 法线编码）
- ✅ TubeGeometry 沿 LineCurve3 渲染弯钩 / 锚固路径

### 7. 下料与导出
- ✅ **钢筋下料表**：编号、等级、直径、单根长、根数、总长(m)、总重(kg)，含合计行
- ✅ **CSV 导出**（UTF-8 BOM，Excel 直接打开）
- ✅ **GLB / GLTF / STL 导出**（顶栏一键下载，含构造细节）

---

## 四、文件结构

```
f:\AIsaibotumu\Test-1\
├── PROGRESS.md                          # ← 当前文件
├── README.md
├── package.json
├── index.html
├── tailwind.config.js / postcss.config.js
├── vite.config.ts / tsconfig*.json
└── src/
    ├── main.tsx
    ├── App.tsx                          # 顶层：构件切换 / 拾取状态 / 导出
    ├── index.css
    ├── types/
    │   ├── beam.ts                      # BeamParams (含支座、锚固、搭接)
    │   ├── component.ts                 # ColumnParams / SlabParams / ComponentKind
    │   └── rebar.ts                     # RebarItem / 角色配色 / 单位重量
    ├── hooks/
    │   ├── useBeamRebars.ts             # 梁布筋 + 锚固路径 + 搭接分段
    │   ├── useColumnRebars.ts           # 柱布筋
    │   └── useSlabRebars.ts             # 板布筋
    ├── utils/
    │   ├── rebarConstants.ts            # 钢筋等级配色 / 标签格式化
    │   ├── rebarGeometry.ts             # 箍筋曲线（双 135° 弯钩）
    │   ├── rebarTexture.ts              # 程序化螺纹法线贴图 Canvas
    │   └── longBarPath.ts               # 纵筋锚固路径 + 搭接切分
    └── components/
        ├── BeamScene.tsx                # 梁 3D 场景
        ├── ColumnScene.tsx              # 柱 3D 场景
        ├── SlabScene.tsx                # 板 3D 场景
        ├── Concrete.tsx                 # 半透明混凝土实体
        ├── Support.tsx                  # 柱状混凝土支座
        ├── LongitudinalRebar.tsx        # 纵筋（多段 TubeGeometry）
        ├── Stirrup.tsx                  # 箍筋阵列
        ├── RebarAnnotation.tsx          # 3D 文字标注（Html）
        ├── RebarTable.tsx               # 右下下料表 + CSV 导出
        ├── ExportButtons.tsx            # 顶栏 GLB/GLTF/STL 按钮
        └── ParameterPanel.tsx           # leva 参数面板 hooks（4 个 hook 各管一类构件）
```

---

## 五、关键工程约定

| 项目 | 默认值 | 含义 |
|------|--------|------|
| `length` | 6000mm | **净跨 Ln**（两支座内表面距离） |
| `cover` | 25mm | 保护层 |
| `supportWidth (hc)` | 400mm | 支座沿梁方向尺寸 |
| `supportDepth (bc)` | 400mm | 支座沿 Z 方向尺寸 |
| `laFactor` | 35 | 锚固倍数 (La = 35d) |
| `bendHook` | 15 | 90° 弯钩平直段倍数 (15d) |
| `maxBarLength` | 9000mm | 钢筋定尺，超过需搭接 |
| `lapFactor` | 1.4 | 搭接倍数 (Ll = 1.4·La) |
| 箍筋弯钩 | max(10d, 75mm) | 抗震 135° 弯钩平直段 |

---

## 六、待办 / 可继续完善的方向（📋）

按优先级排序，下次可挑选继续：

### 高优先级
- [ ] **搭接区视觉表现**：当前搭接段沿同一直线重合会有 z-fighting，可考虑 Y 方向微小偏移 (±0.3d) + 弯钩段保持原 Y，让两段并排可见
- [ ] **箍筋加密区**：抗震梁端部应有加密区（h0 或 1.5h 范围内间距加密一半），当前是均匀间距
- [ ] **支座内的钢筋穿过 / 节点钢筋**：当前柱支座是空的盒子，应该体现"梁筋穿入柱内 + 柱筋"以表达节点构造

### 中优先级
- [ ] **拉筋 / 复合箍**：当前只有单肢箍，截面宽时应有内部拉筋
- [ ] **吊筋 / 附加箍筋**：次梁与主梁相交处的附加配筋
- [ ] **弯起钢筋**：抗剪用斜向弯起钢筋
- [ ] **柱、板的锚固与搭接**：当前柱纵筋是直筒、板筋也没有弯钩，应迁移梁的锚固/搭接体系
- [ ] **断面图 2D 视图**：右下角同步显示梁截面 2D 配筋图

### 低优先级 / 增强
- [ ] **数据持久化**：用 zustand + localStorage 保存参数、可读取项目预设
- [ ] **国标查表**：根据梁宽/高自动按 11G101 给推荐配筋
- [ ] **多构件组合场景**：一根梁 + 两根柱 + 一块板的完整框架节点
- [ ] **测量工具**：在 3D 中点击两点显示距离
- [ ] **打印 / PDF 导出施工图**

### 已知技术债
- [ ] `splitForLap` 函数对 fullPoints.length=2（直锚腰筋）情况有特殊路径处理，可重构得更优雅
- [ ] `BeamScene.tsx` 长度 180+ 行，标注块可抽组件
- [ ] `LongitudinalRebar` 中 TubeGeometry 没有在卸载时 `dispose()`，长会话可能内存增长
- [ ] 柱、板 Scene 中弯锚/搭接尚未启用，复用率不高

---

## 七、下次接续的快速上手

1. **启动**：在终端 `npm run dev` → 浏览器 http://localhost:5173
2. **改梁**：左侧 Leva 面板 "梁参数" 区域
3. **切构件**：顶部 "构件类型" 下拉
4. **加新功能**：参考 `useBeamRebars.ts` 的 layout 模式 + 在对应 Scene 中渲染
5. **若类型报错**：`npx tsc -b --pretty false`

---

## 八、用户偏好

- 中文交流
- 简洁直接的进度汇报
- 倾向最小改动 / 不过度工程化
- 注释保持现状，不主动增删
