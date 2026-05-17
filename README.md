# 3D 钢筋平法可视化 (梁)

基于 React Three Fiber + Three.js 的纯前端钢筋混凝土梁三维参数化可视化。

## 功能特性

- **参数化建模**：实时调整梁尺寸/纵筋/箍筋/腰筋/保护层等
- **PBR 物理渲染**：金属质感钢筋 + HDR 环境光照
- **混凝土透明度切换**：方便查看内部配筋
- **剖面切割视图**：沿梁长方向可拖动切割面，查看截面配筋
- **3D 标注**：显示钢筋型号、间距、保护层等信息
- **可旋转/缩放/平移**：完整的 3D 视图交互

## 技术栈

- Vite + React 18 + TypeScript
- @react-three/fiber + @react-three/drei
- three.js (PBR / TubeGeometry / clippingPlanes)
- leva (参数控制面板)
- Tailwind CSS

## 启动方式

```bash
npm install
npm run dev
```

打开 http://localhost:5173 即可使用。

## 项目结构

```
src/
├── App.tsx                       # 主入口 (Canvas + UI)
├── components/
│   ├── BeamScene.tsx             # 3D 场景主组件
│   ├── Concrete.tsx              # 混凝土
│   ├── LongitudinalRebar.tsx     # 纵筋 / 腰筋
│   ├── Stirrup.tsx               # 箍筋
│   ├── RebarAnnotation.tsx       # HTML 标注
│   └── ParameterPanel.tsx        # leva 参数面板
├── utils/
│   ├── rebarGeometry.ts          # 几何生成工具
│   └── rebarConstants.ts         # 钢筋规格表
└── types/beam.ts                 # 类型定义
```

## 钢筋符号约定

- `C` = HRB400 普通钢筋
- `G` = HPB300 光圆钢筋
- `E` = HRB500 高强钢筋

例：`4C25` 表示 4 根 HRB400 直径 25mm 的钢筋。
