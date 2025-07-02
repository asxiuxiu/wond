# CanvasKit-WASM API 详细文档

## 概述

CanvasKit-WASM 是 Google Skia 图形库的 WebAssembly 版本，提供了强大的 2D 图形渲染能力。它允许在 Web 平台上进行高性能的图形绘制、文本渲染、动画制作等操作。

## 初始化

### CanvasKitInit

```typescript
import CanvasKitInit from 'canvaskit-wasm';

// 基本初始化
const CanvasKit = await CanvasKitInit();

// 带选项的初始化
const CanvasKit = await CanvasKitInit({
  locateFile: (file: string) => `/path/to/wasm/${file}`
});
```

**参数说明：**
- `locateFile`: 可选的回调函数，用于指定 WASM 文件的位置

---

## 核心概念

### 1. 颜色系统

#### Color API

```typescript
// 创建颜色 (r, g, b, a) - RGB 值 0-255，alpha 值 0-1
const red = CanvasKit.Color(255, 0, 0, 1.0);

// 创建高精度颜色 (r, g, b, a) - 所有值 0-1
const blue = CanvasKit.Color4f(0.0, 0.0, 1.0, 1.0);

// 创建32位整数颜色
const green = CanvasKit.ColorAsInt(0, 255, 0, 255);

// 解析CSS颜色字符串
const purple = CanvasKit.parseColorString('#800080');
const orange = CanvasKit.parseColorString('rgb(255, 165, 0)');

// 颜色工具函数
const components = CanvasKit.getColorComponents(red); // [255, 0, 0, 1]
const transparent = CanvasKit.multiplyByAlpha(red, 0.5); // 半透明红色
```

#### 预定义颜色常量

```typescript
const colors = {
  transparent: CanvasKit.TRANSPARENT,
  black: CanvasKit.BLACK,
  white: CanvasKit.WHITE,
  red: CanvasKit.RED,
  green: CanvasKit.GREEN,
  blue: CanvasKit.BLUE,
  yellow: CanvasKit.YELLOW,
  cyan: CanvasKit.CYAN,
  magenta: CanvasKit.MAGENTA
};
```

### 2. 几何图形

#### 矩形 (Rectangle)

```typescript
// 左上右下坐标创建矩形
const rect1 = CanvasKit.LTRBRect(10, 20, 100, 80);

// 坐标和宽高创建矩形
const rect2 = CanvasKit.XYWHRect(10, 20, 90, 60);

// 整数矩形
const iRect1 = CanvasKit.LTRBiRect(10, 20, 100, 80);
const iRect2 = CanvasKit.XYWHiRect(10, 20, 90, 60);

// 圆角矩形
const roundRect = CanvasKit.RRectXY(rect1, 10, 10); // rx=10, ry=10
```

#### 路径 (Path)

```typescript
const path = new CanvasKit.Path();

// 基本路径操作
path.moveTo(10, 10);
path.lineTo(100, 10);
path.lineTo(100, 100);
path.quadTo(50, 150, 10, 100); // 二次贝塞尔曲线
path.cubicTo(0, 50, 50, 0, 100, 50); // 三次贝塞尔曲线
path.close();

// 添加几何图形
path.addRect(rect1);
path.addOval(rect2);
path.addCircle(50, 50, 25);
path.addRRect(roundRect);

// 路径变换
const matrix = CanvasKit.Matrix.identity();
CanvasKit.Matrix.translated(matrix, 50, 50);
path.transform(matrix);

// 路径操作
const path2 = new CanvasKit.Path();
const result = path.op(path2, CanvasKit.PathOp.Union);
```

---

## 表面 (Surface) 和画布 (Canvas)

### 创建表面

```typescript
// CPU 表面 (软件渲染)
const surface = CanvasKit.MakeSWCanvasSurface('canvas-id');

// WebGL 表面 (硬件加速)
const glSurface = CanvasKit.MakeWebGLCanvasSurface('canvas-id', {
  alpha: 1,
  depth: 1,
  stencil: 8,
  antialias: 1,
  premultipliedAlpha: 1,
  preserveDrawingBuffer: 0,
  preferLowPowerToHighPerformance: 0,
  failIfMajorPerformanceCaveat: 0,
  enableExtensionsByDefault: 1,
  explicitSwapControl: 0,
  renderViaOffscreenBackBuffer: 0
});

// 内存表面
const offscreenSurface = CanvasKit.MakeSurface(800, 600);

// 直接像素访问表面
const pixels = CanvasKit.Malloc(Uint8Array, 800 * 600 * 4);
const directSurface = CanvasKit.MakeRasterDirectSurface({
  width: 800,
  height: 600,
  colorType: CanvasKit.ColorType.RGBA_8888,
  alphaType: CanvasKit.AlphaType.Unpremul
}, pixels, 800 * 4);
```

### WebGPU 支持

```typescript
// WebGPU 设备上下文
const device = await navigator.gpu.requestAdapter().requestDevice();
const gpuContext = CanvasKit.MakeGPUDeviceContext(device);

// WebGPU 画布上下文
const canvas = document.getElementById('webgpu-canvas');
const canvasContext = CanvasKit.MakeGPUCanvasContext(gpuContext, canvas);

// WebGPU 表面
const gpuSurface = CanvasKit.MakeGPUCanvasSurface(
  canvasContext, 
  CanvasKit.ColorSpace.SRGB
);
```

---

## 绘画 (Paint) 和样式

### Paint 对象

```typescript
const paint = new CanvasKit.Paint();

// 基本属性
paint.setColor(CanvasKit.Color(255, 0, 0, 1.0));
paint.setStyle(CanvasKit.PaintStyle.Fill); // Fill 或 Stroke
paint.setAntiAlias(true);

// 描边属性
paint.setStyle(CanvasKit.PaintStyle.Stroke);
paint.setStrokeWidth(5);
paint.setStrokeCap(CanvasKit.StrokeCap.Round);
paint.setStrokeJoin(CanvasKit.StrokeJoin.Round);
paint.setStrokeMiter(4.0);

// 混合模式
paint.setBlendMode(CanvasKit.BlendMode.Multiply);
```

### 着色器 (Shader)

```typescript
// 线性渐变
const linearGradient = CanvasKit.Shader.MakeLinearGradient(
  [0, 0],        // 起点
  [100, 100],    // 终点
  [CanvasKit.RED, CanvasKit.BLUE], // 颜色数组
  [0.0, 1.0],    // 位置数组
  CanvasKit.TileMode.Clamp
);

// 径向渐变
const radialGradient = CanvasKit.Shader.MakeRadialGradient(
  [50, 50],      // 中心点
  30,            // 半径
  [CanvasKit.WHITE, CanvasKit.BLACK],
  [0.0, 1.0],
  CanvasKit.TileMode.Clamp
);

// 扫描渐变
const sweepGradient = CanvasKit.Shader.MakeSweepGradient(
  50, 50,        // 中心点
  [CanvasKit.RED, CanvasKit.GREEN, CanvasKit.BLUE],
  [0.0, 0.5, 1.0]
);

// 两点圆锥渐变
const conicalGradient = CanvasKit.Shader.MakeTwoPointConicalGradient(
  [0, 0], 10,    // 起始圆心和半径
  [100, 100], 50, // 结束圆心和半径
  [CanvasKit.YELLOW, CanvasKit.MAGENTA],
  [0.0, 1.0],
  CanvasKit.TileMode.Clamp
);

// 应用着色器
paint.setShader(linearGradient);
```

### 滤镜效果

#### 颜色滤镜

```typescript
// 颜色矩阵滤镜
const colorMatrix = [
  1, 0, 0, 0, 0,  // R
  0, 1, 0, 0, 0,  // G
  0, 0, 1, 0, 0,  // B
  0, 0, 0, 1, 0   // A
];
const matrixFilter = CanvasKit.ColorFilter.MakeMatrix(colorMatrix);

// 混合模式滤镜
const blendFilter = CanvasKit.ColorFilter.MakeBlend(
  CanvasKit.BLUE,
  CanvasKit.BlendMode.Multiply
);

// 线性到sRGB伽马滤镜
const gammaFilter = CanvasKit.ColorFilter.MakeLinearToSRGBGamma();

paint.setColorFilter(matrixFilter);
```

#### 图像滤镜

```typescript
// 模糊滤镜
const blurFilter = CanvasKit.ImageFilter.MakeBlur(
  5, 5,  // sigmaX, sigmaY
  CanvasKit.TileMode.Clamp,
  null   // input
);

// 阴影滤镜
const dropShadowFilter = CanvasKit.ImageFilter.MakeDropShadow(
  3, 3,    // dx, dy
  2, 2,    // sigmaX, sigmaY
  CanvasKit.BLACK,
  null     // input
);

// 色彩调整滤镜
const colorMatrixImageFilter = CanvasKit.ImageFilter.MakeColorFilter(
  matrixFilter,
  null
);

paint.setImageFilter(blurFilter);
```

#### 遮罩滤镜

```typescript
// 模糊遮罩
const maskBlur = CanvasKit.MaskFilter.MakeBlur(
  CanvasKit.BlurStyle.Normal,
  3.0,     // sigma
  true     // respectCTM
);

paint.setMaskFilter(maskBlur);
```

---

## 绘图操作

### 基本绘图

```typescript
const canvas = surface.getCanvas();

// 清除画布
canvas.clear(CanvasKit.WHITE);

// 绘制基本图形
canvas.drawRect(rect, paint);
canvas.drawCircle(50, 50, 25, paint);
canvas.drawOval(rect, paint);
canvas.drawRRect(roundRect, paint);
canvas.drawPath(path, paint);

// 绘制点和线
const points = [10, 10, 20, 20, 30, 10, 40, 20];
canvas.drawPoints(CanvasKit.PointMode.Lines, points, paint);

// 绘制弧形
canvas.drawArc(rect, 0, Math.PI, true, paint);

// 绘制多边形
const vertices = CanvasKit.MakeVertices(
  CanvasKit.VertexMode.Triangles,
  [0, 0, 50, 0, 25, 50], // positions
  null,                   // textureCoordinates
  [CanvasKit.RED, CanvasKit.GREEN, CanvasKit.BLUE] // colors
);
canvas.drawVertices(vertices, CanvasKit.BlendMode.SrcOver, paint);
```

### 变换操作

```typescript
// 保存和恢复状态
canvas.save();

// 基本变换
canvas.translate(50, 50);
canvas.rotate(Math.PI / 4, 0, 0);  // 角度, 中心点x, 中心点y
canvas.scale(2.0, 2.0);
canvas.skew(0.1, 0);

// 矩阵变换
const matrix = CanvasKit.Matrix.multiply(
  CanvasKit.Matrix.rotated(Math.PI / 4),
  CanvasKit.Matrix.scaled(2, 2)
);
canvas.concat(matrix);

// 恢复状态
canvas.restore();
```

### 裁剪操作

```typescript
// 矩形裁剪
canvas.clipRect(rect, CanvasKit.ClipOp.Intersect, true);

// 路径裁剪
canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);

// 圆角矩形裁剪
canvas.clipRRect(roundRect, CanvasKit.ClipOp.Intersect, true);
```

---

## 文本渲染

### 字体管理

```typescript
// 创建字体
const fontData = await fetch('/fonts/Roboto-Regular.ttf').then(r => r.arrayBuffer());
const typeface = CanvasKit.Typeface.MakeTypefaceFromData(fontData);

const font = new CanvasKit.Font(typeface, 24);
font.setEdging(CanvasKit.FontEdging.AntiAlias);
font.setHinting(CanvasKit.FontHinting.Slight);

// 字体度量
const metrics = font.getMetrics();
console.log('Font height:', metrics.fHeight);
console.log('Ascent:', metrics.fAscent);
console.log('Descent:', metrics.fDescent);
```

### 简单文本绘制

```typescript
// 创建文本Blob
const textBlob = CanvasKit.TextBlob.MakeFromText('Hello World', font);

// 绘制文本
canvas.drawTextBlob(textBlob, 10, 50, paint);

// 沿路径绘制文本
const pathText = CanvasKit.TextBlob.MakeOnPath('Curved Text', path, font);
canvas.drawTextBlob(pathText, 0, 0, paint);
```

### 高级段落系统

```typescript
// 创建段落样式
const paragraphStyle = new CanvasKit.ParagraphStyle({
  textAlign: CanvasKit.TextAlign.Center,
  textDirection: CanvasKit.TextDirection.LTR,
  maxLines: 10,
  ellipsis: '...'
});

// 创建文本样式
const textStyle = new CanvasKit.TextStyle({
  color: CanvasKit.BLACK,
  fontSize: 16,
  fontFamilies: ['Arial', 'sans-serif'],
  fontStyle: {
    weight: CanvasKit.FontWeight.Normal,
    width: CanvasKit.FontWidth.Normal,
    slant: CanvasKit.FontSlant.Upright
  }
});

// 构建段落
const fontProvider = CanvasKit.TypefaceFontProvider.Make();
fontProvider.registerFont(fontData, 'MyFont');

const fontCollection = CanvasKit.FontCollection.Make();
fontCollection.setDefaultFontManager(fontProvider);

const paragraphBuilder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontCollection);
paragraphBuilder.pushStyle(textStyle);
paragraphBuilder.addText('这是一个多行文本段落的例子。支持不同的字体样式、颜色和对齐方式。');
paragraphBuilder.pop();

const paragraph = paragraphBuilder.build();
paragraph.layout(300); // 布局宽度

// 绘制段落
canvas.drawParagraph(paragraph, 10, 10);

// 获取段落信息
const lineMetrics = paragraph.getLineMetrics();
const glyphInfo = paragraph.getGlyphInfoAt(0);
```

---

## 图像处理

### 图像创建和加载

```typescript
// 从编码数据创建图像
const imageData = await fetch('/images/photo.jpg').then(r => r.arrayBuffer());
const image = CanvasKit.MakeImageFromEncoded(imageData);

// 从Canvas ImageSource创建图像
const htmlImage = document.getElementById('my-image');
const canvasImage = CanvasKit.MakeImageFromCanvasImageSource(htmlImage);

// 从像素数据创建图像
const imageInfo = {
  width: 100,
  height: 100,
  colorType: CanvasKit.ColorType.RGBA_8888,
  alphaType: CanvasKit.AlphaType.Unpremul
};
const pixels = new Uint8Array(100 * 100 * 4);
const pixelImage = CanvasKit.MakeImage(imageInfo, pixels, 100 * 4);

// GPU纹理图像
const textureImage = CanvasKit.MakeLazyImageFromTextureSource(
  htmlImage,
  imageInfo,
  false  // srcIsPremul
);
```

### 图像绘制

```typescript
// 基本图像绘制
canvas.drawImage(image, 10, 10, paint);

// 缩放绘制
canvas.drawImageRect(
  image,
  CanvasKit.XYWHRect(0, 0, 100, 100),    // 源矩形
  CanvasKit.XYWHRect(10, 10, 200, 200),  // 目标矩形
  paint,
  false  // strict
);

// 九宫格绘制
canvas.drawImageNine(
  image,
  CanvasKit.LTRBiRect(10, 10, 90, 90),   // 中心区域
  CanvasKit.XYWHRect(0, 0, 300, 300),    // 目标区域
  CanvasKit.FilterMode.Linear,
  paint
);
```

---

## 动画

### Skottie 动画

```typescript
// 基础Skottie动画
const animationData = await fetch('/animations/example.json').then(r => r.text());
const animation = CanvasKit.MakeAnimation(animationData);

// 托管Skottie动画（支持资源和声音）
const assets = {
  'image1.png': await fetch('/assets/image1.png').then(r => r.arrayBuffer()),
  'image2.jpg': await fetch('/assets/image2.jpg').then(r => r.arrayBuffer())
};

const soundMap = {
  getPlayer: (key) => ({
    seek: (t) => console.log(`Playing sound ${key} at time ${t}`)
  })
};

const managedAnimation = CanvasKit.MakeManagedAnimation(
  animationData,
  assets,
  'myAnimation_',  // filterPrefix
  soundMap
);

// 动画控制
function animate() {
  const t = (Date.now() % (animation.duration() * 1000)) / 1000;
  animation.seek(t);
  
  canvas.clear(CanvasKit.WHITE);
  animation.render(canvas, CanvasKit.XYWHRect(0, 0, 400, 400));
  
  surface.requestAnimationFrame(animate);
}
animate();

// 获取动画信息
console.log('Duration:', animation.duration());
console.log('FPS:', animation.fps());

// 动画标记
const markers = managedAnimation.markers();
markers.forEach(marker => {
  console.log(`Marker: ${marker.name}, Start: ${marker.t0}, End: ${marker.t1}`);
});
```

### 动画图像

```typescript
const animImageData = await fetch('/animations/animated.gif').then(r => r.arrayBuffer());
const animatedImage = CanvasKit.MakeAnimatedImageFromEncoded(animImageData);

if (animatedImage) {
  let frameIndex = 0;
  
  function drawAnimatedImage() {
    const frame = animatedImage.makeImageAtCurrentFrame();
    canvas.clear(CanvasKit.WHITE);
    canvas.drawImage(frame, 0, 0, paint);
    
    const duration = animatedImage.currentFrameDuration();
    animatedImage.decodeNextFrame();
    
    setTimeout(drawAnimatedImage, duration);
  }
  
  drawAnimatedImage();
}
```

---

## 高级功能

### 运行时效果 (Runtime Effects)

```typescript
const sksl = `
uniform float iTime;
uniform float2 iResolution;

float4 main(float2 coord) {
    float2 uv = coord / iResolution;
    float3 color = 0.5 + 0.5 * cos(iTime + uv.xyx + float3(0, 2, 4));
    return float4(color, 1.0);
}
`;

const effect = CanvasKit.RuntimeEffect.Make(sksl);
if (effect) {
  const shader = effect.makeShader([
    Date.now() / 1000,  // iTime
    400, 300            // iResolution
  ]);
  
  paint.setShader(shader);
  canvas.drawRect(CanvasKit.XYWHRect(0, 0, 400, 300), paint);
}
```

### 阴影绘制

```typescript
// 计算阴影边界
const shadowBounds = CanvasKit.getShadowLocalBounds(
  CanvasKit.Matrix.identity(),    // CTM
  path,                           // 遮挡物路径
  [0, 0, 4],                     // Z平面参数
  [100, 100, 600],               // 光源位置
  100,                           // 光源半径
  0                              // 标志
);

// 绘制阴影
canvas.drawShadow(
  path,                          // 路径
  [0, 0, 4],                    // Z平面参数
  [100, 100, 600],              // 光源位置
  100,                          // 光源半径
  CanvasKit.Color(0, 0, 0, 0.3), // 环境光颜色  
  CanvasKit.Color(0, 0, 0, 0.5), // 聚光灯颜色
  0                             // 标志
);
```

### 图片录制

```typescript
const recorder = new CanvasKit.PictureRecorder();
const recordingCanvas = recorder.beginRecording(CanvasKit.XYWHRect(0, 0, 400, 300));

// 在录制画布上绘制
recordingCanvas.drawRect(CanvasKit.XYWHRect(10, 10, 100, 100), paint);
recordingCanvas.drawCircle(200, 150, 50, paint);

// 完成录制
const picture = recorder.finishRecordingAsPicture();

// 播放图片
canvas.drawPicture(picture);

// 序列化图片
const serialized = picture.serialize();
// 可以保存serialized数据，稍后重新加载
const loadedPicture = CanvasKit.MakePicture(serialized);
```

---

## 内存管理

### Malloc 对象

```typescript
// 分配内存
const floatArray = CanvasKit.Malloc(Float32Array, 100);
const glyphIDs = CanvasKit.MallocGlyphIDs(50);

// 使用内存
const typedArray = floatArray.toTypedArray();
typedArray[0] = 1.5;
typedArray[1] = 2.0;

// 子数组视图
const subarray = floatArray.subarray(10, 20);

// 释放内存（重要！）
CanvasKit.Free(floatArray);
CanvasKit.Free(glyphIDs);
```

### 对象生命周期管理

```typescript
// 大多数CanvasKit对象都需要手动删除
const paint = new CanvasKit.Paint();
const path = new CanvasKit.Path();
const font = new CanvasKit.Font();

// 使用对象...

// 清理
paint.delete();
path.delete();
font.delete();

// 或者使用deleteLater()延迟删除
paint.deleteLater();
```

---

## 常用枚举值

### 混合模式

```typescript
const blendModes = {
  // 基础模式
  Clear: CanvasKit.BlendMode.Clear,
  Src: CanvasKit.BlendMode.Src,
  Dst: CanvasKit.BlendMode.Dst,
  SrcOver: CanvasKit.BlendMode.SrcOver,
  DstOver: CanvasKit.BlendMode.DstOver,
  SrcIn: CanvasKit.BlendMode.SrcIn,
  DstIn: CanvasKit.BlendMode.DstIn,
  SrcOut: CanvasKit.BlendMode.SrcOut,
  DstOut: CanvasKit.BlendMode.DstOut,
  SrcATop: CanvasKit.BlendMode.SrcATop,
  DstATop: CanvasKit.BlendMode.DstATop,
  Xor: CanvasKit.BlendMode.Xor,
  Plus: CanvasKit.BlendMode.Plus,
  
  // 混合模式
  Multiply: CanvasKit.BlendMode.Multiply,
  Screen: CanvasKit.BlendMode.Screen,
  Overlay: CanvasKit.BlendMode.Overlay,
  Darken: CanvasKit.BlendMode.Darken,
  Lighten: CanvasKit.BlendMode.Lighten,
  ColorDodge: CanvasKit.BlendMode.ColorDodge,
  ColorBurn: CanvasKit.BlendMode.ColorBurn,
  HardLight: CanvasKit.BlendMode.HardLight,
  SoftLight: CanvasKit.BlendMode.SoftLight,
  Difference: CanvasKit.BlendMode.Difference,
  Exclusion: CanvasKit.BlendMode.Exclusion
};
```

### 颜色类型和透明度类型

```typescript
const colorTypes = {
  Alpha_8: CanvasKit.ColorType.Alpha_8,
  RGB_565: CanvasKit.ColorType.RGB_565,
  RGBA_8888: CanvasKit.ColorType.RGBA_8888,
  BGRA_8888: CanvasKit.ColorType.BGRA_8888,
  RGBA_F16: CanvasKit.ColorType.RGBA_F16,
  RGBA_F32: CanvasKit.ColorType.RGBA_F32
};

const alphaTypes = {
  Opaque: CanvasKit.AlphaType.Opaque,
  Premul: CanvasKit.AlphaType.Premul,
  Unpremul: CanvasKit.AlphaType.Unpremul
};
```

---

## 实用工具和辅助函数

### 矩阵操作

```typescript
// 创建变换矩阵
const identity = CanvasKit.Matrix.identity();
const translated = CanvasKit.Matrix.translated(50, 100);
const scaled = CanvasKit.Matrix.scaled(2, 2);
const rotated = CanvasKit.Matrix.rotated(Math.PI / 4);

// 矩阵运算
const combined = CanvasKit.Matrix.multiply(scaled, rotated);
const inverted = CanvasKit.Matrix.invert(combined);

// 4x4矩阵操作
const matrix44 = CanvasKit.M44.identity();
CanvasKit.M44.translate(matrix44, 10, 20, 30);
CanvasKit.M44.scale(matrix44, 2, 2, 2);
```

### 向量操作

```typescript
const vec1 = [1, 2, 3];
const vec2 = [4, 5, 6];

// 向量运算
const sum = CanvasKit.Vector.add(vec1, vec2);
const difference = CanvasKit.Vector.sub(vec1, vec2);
const dotProduct = CanvasKit.Vector.dot(vec1, vec2);
const crossProduct = CanvasKit.Vector.cross(vec1, vec2);
const length = CanvasKit.Vector.length(vec1);
const normalized = CanvasKit.Vector.normalize(vec1);
```

---

## 性能优化建议

### 1. 内存管理

```typescript
// 正确的内存管理模式
function drawComplexShape() {
  const paint = new CanvasKit.Paint();
  const path = new CanvasKit.Path();
  
  try {
    // 使用paint和path进行绘制
    setupPaintAndPath(paint, path);
    canvas.drawPath(path, paint);
  } finally {
    // 确保清理资源
    paint.delete();
    path.delete();
  }
}

// 对于频繁使用的对象，可以复用
class Renderer {
  constructor() {
    this.paint = new CanvasKit.Paint();
    this.path = new CanvasKit.Path();
  }
  
  render() {
    this.path.reset();
    // 重新配置path...
    canvas.drawPath(this.path, this.paint);
  }
  
  dispose() {
    this.paint.delete();
    this.path.delete();
  }
}
```

### 2. 批量操作

```typescript
// 批量绘制相似对象
function drawMultipleShapes(shapes) {
  const paint = new CanvasKit.Paint();
  
  // 设置一次paint属性
  paint.setColor(CanvasKit.RED);
  paint.setStyle(CanvasKit.PaintStyle.Fill);
  
  // 批量绘制
  shapes.forEach(shape => {
    canvas.drawRect(shape.rect, paint);
  });
  
  paint.delete();
}
```

### 3. 使用适当的表面类型

```typescript
// 对于静态内容，使用CPU表面可能更合适
const cpuSurface = CanvasKit.MakeSWCanvasSurface('static-canvas');

// 对于动画和交互内容，使用GPU表面
const gpuSurface = CanvasKit.MakeWebGLCanvasSurface('animated-canvas');
```

---

## 常见问题和解决方案

### 1. 文本渲染问题

```typescript
// 确保字体正确加载
async function setupFonts() {
  const fontData = await fetch('/fonts/MyFont.ttf').then(r => r.arrayBuffer());
  if (fontData.byteLength === 0) {
    throw new Error('Font file is empty');
  }
  
  const typeface = CanvasKit.Typeface.MakeTypefaceFromData(fontData);
  if (!typeface) {
    throw new Error('Failed to create typeface from font data');
  }
  
  return typeface;
}
```

### 2. 图像加载失败

```typescript
async function loadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const image = CanvasKit.MakeImageFromEncoded(arrayBuffer);
    
    if (!image) {
      throw new Error('Failed to decode image');
    }
    
    return image;
  } catch (error) {
    console.error('Image loading failed:', error);
    return null;
  }
}
```

### 3. WebGL上下文丢失处理

```typescript
function createRobustWebGLSurface(canvasId) {
  const canvas = document.getElementById(canvasId);
  
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.log('WebGL context lost');
  });
  
  canvas.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
    // 重新创建表面和资源
    recreateResources();
  });
  
  return CanvasKit.MakeWebGLCanvasSurface(canvasId);
}
```

---

## 总结

CanvasKit-WASM 提供了完整的 2D 图形渲染能力，包括：

- **基础绘图**: 图形、路径、文本绘制
- **高级效果**: 滤镜、着色器、混合模式
- **图像处理**: 图像加载、变换、滤镜应用
- **动画支持**: Skottie动画、帧动画
- **文本排版**: 高级段落系统、字体管理
- **性能优化**: GPU加速、WebGPU支持

使用时需要注意内存管理，及时释放创建的对象，并根据具体需求选择合适的表面类型和渲染方式。 