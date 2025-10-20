// CanvasKit TypeScript 类型定义文件 - 详细中文注释版本
// Minimum TypeScript Version: 4.4
/// <reference types="@webgpu/types" />

/**
 * CanvasKit 初始化函数
 * 初始化 CanvasKit WASM 模块并返回 CanvasKit 实例
 * 
 * @param opts - 可选的初始化选项
 * @returns 返回一个 Promise，解析为 CanvasKit 实例
 * 
 * 用法示例:
 * ```typescript
 * import CanvasKitInit from 'canvaskit-wasm';
 * 
 * const CanvasKit = await CanvasKitInit({
 *   locateFile: (file) => '/path/to/canvaskit/' + file
 * });
 * ```
 */
export default function CanvasKitInit(opts?: CanvasKitInitOptions): Promise<CanvasKit>;

/**
 * CanvasKit 初始化选项接口
 * 用于配置 CanvasKit 的加载行为
 */
export interface CanvasKitInitOptions {
    /**
     * 文件定位回调函数
     * 当 CanvasKit 加载器需要获取文件时会调用此回调（例如 WASM 代码的 blob）
     * 应该应用正确的 URL 前缀
     * 
     * @param file - 即将被加载的文件名
     * @returns 返回文件的完整 URL 路径
     * 
     * 用法示例:
     * ```typescript
     * locateFile: (file) => {
     *   if (file.endsWith('.wasm')) {
     *     return 'https://unpkg.com/canvaskit-wasm@latest/bin/' + file;
     *   }
     *   return file;
     * }
     * ```
     */
    locateFile(file: string): string;
}

/**
 * CanvasKit 主接口
 * 包含所有 CanvasKit 的核心功能和工厂方法
 * 这是使用 CanvasKit 的主要入口点
 */
export interface CanvasKit {
    // ================== 辅助工具方法 ==================
    
    /**
     * 构造颜色对象，使用与 CSS rgba() 相同的 API
     * 内部表示为四个未预乘的 32 位浮点数：r, g, b, a
     * 如需更高精度或更宽色域，请使用 CanvasKit.Color4f()
     *
     * @param r - 红色值，限制在 [0, 255] 范围内
     * @param g - 绿色值，限制在 [0, 255] 范围内  
     * @param b - 蓝色值，限制在 [0, 255] 范围内
     * @param a - 透明度值，范围 0 到 1.0，默认为 1.0（不透明）
     * @returns 返回 Color 对象
     * 
     * 用法示例:
     * ```typescript
     * const red = CanvasKit.Color(255, 0, 0, 1.0);
     * const semiTransparentBlue = CanvasKit.Color(0, 0, 255, 0.5);
     * ```
     */
    Color(r: number, g: number, b: number, a?: number): Color;

    /**
     * 构造 4 浮点数颜色对象
     * 浮点值通常在 0.0 到 1.0 之间，提供更高精度的颜色表示
     * 
     * @param r - 红色值（浮点数）
     * @param g - 绿色值（浮点数）
     * @param b - 蓝色值（浮点数）
     * @param a - 透明度值，默认为 1.0（不透明）
     * @returns 返回 Color 对象
     * 
     * 用法示例:
     * ```typescript
     * const red = CanvasKit.Color4f(1.0, 0.0, 0.0, 1.0);
     * const purple = CanvasKit.Color4f(0.5, 0.0, 0.5, 1.0);
     * ```
     */
    Color4f(r: number, g: number, b: number, a?: number): Color;

    /**
     * 构造颜色作为 32 位无符号整数，每个通道分配 8 位
     * 通道值期望在 0 到 255 之间，会被限制在此范围内
     * 如果省略 a，默认为 255（不透明）
     * 
     * 注意：这不是在 Skia API 中使用颜色的首选方式，请使用 Color 或 Color4f
     * 
     * @param r - 红色值，限制在 [0, 255] 范围内
     * @param g - 绿色值，限制在 [0, 255] 范围内
     * @param b - 蓝色值，限制在 [0, 255] 范围内
     * @param a - 透明度值，范围 0 到 1.0，默认为 1.0（不透明）
     * @returns 返回 ColorInt 对象
     */
    ColorAsInt(r: number, g: number, b: number, a?: number): ColorInt;

    /**
     * 返回 CSS 样式的 [r, g, b, a] 数组
     * r, g, b 作为 [0, 255] 范围内的整数返回，a 在 0 和 1.0 之间缩放
     * [已弃用] - 现在 Color 是 4 个浮点数，这个方法已经很简单了
     * 
     * @param c - 要分解的颜色对象
     * @returns 返回包含 [r, g, b, a] 的数组
     * 
     * 用法示例:
     * ```typescript
     * const color = CanvasKit.Color(255, 128, 0, 0.5);
     * const components = CanvasKit.getColorComponents(color);
     * // components = [255, 128, 0, 0.5]
     * ```
     */
    getColorComponents(c: Color): number[];

    /**
     * 解析 CSS 颜色值并返回 CanvasKit.Color
     * （RGBA 顺序的 4 个浮点数数组）
     * 可以提供可选的 colorMap，将自定义字符串映射到值
     * 
     * @param color - CSS 颜色字符串，如 "red", "#FF0000", "rgb(255,0,0)" 等
     * @param colorMap - 可选的自定义颜色名称映射
     * @returns 返回解析后的 Color 对象
     * 
     * 用法示例:
     * ```typescript
     * const red = CanvasKit.parseColorString("red");
     * const blue = CanvasKit.parseColorString("#0000FF");
     * const customColor = CanvasKit.parseColorString("myColor", {
     *   myColor: CanvasKit.Color(100, 200, 50)
     * });
     * ```
     */
    parseColorString(color: string, colorMap?: Record<string, Color>): Color;

    /**
     * 返回应用新透明度值的颜色副本
     * [已弃用] - 现在 Color 是 4 个浮点数，这个操作已经很简单了
     * 
     * @param c - 原始颜色
     * @param alpha - 新的透明度值
     * @returns 返回新的颜色对象
     */
    multiplyByAlpha(c: Color, alpha: number): Color;

    /**
     * 计算单次色调 alpha 的颜色值
     * 注意：如果传入已分配的颜色，MallocObj 指向的内存将被计算出的色调颜色覆盖
     * 
     * @param colors - 色调颜色输入
     * @returns 返回色调颜色输出
     * 
     * 用法示例:
     * ```typescript
     * const tonalColors = CanvasKit.computeTonalColors({
     *   ambient: CanvasKit.Color(100, 100, 100),
     *   spot: CanvasKit.Color(200, 200, 200)
     * });
     * ```
     */
    computeTonalColors(colors: TonalColorsInput): TonalColorsOutput;

    // ================== 矩形构造方法 ==================

    /**
     * 使用给定参数返回矩形对象
     * 使用左-上-右-下的坐标系统
     * 
     * @param left - 左上角的 x 坐标
     * @param top - 左上角的 y 坐标
     * @param right - 右下角的 x 坐标
     * @param bottom - 右下角的 y 坐标
     * @returns 返回 Rect 对象
     * 
     * 用法示例:
     * ```typescript
     * const rect = CanvasKit.LTRBRect(10, 20, 100, 80);
     * // 创建一个从 (10,20) 到 (100,80) 的矩形
     * ```
     */
    LTRBRect(left: number, top: number, right: number, bottom: number): Rect;

    /**
     * 使用给定参数返回矩形对象
     * 使用坐标和宽高的表示方式
     * 
     * @param x - 左上角的 x 坐标
     * @param y - 左上角的 y 坐标
     * @param width - 矩形的宽度
     * @param height - 矩形的高度
     * @returns 返回 Rect 对象
     * 
     * 用法示例:
     * ```typescript
     * const rect = CanvasKit.XYWHRect(10, 20, 90, 60);
     * // 创建一个从 (10,20) 开始，宽90高60的矩形
     * ```
     */
    XYWHRect(x: number, y: number, width: number, height: number): Rect;

    /**
     * 使用给定整数参数返回整数矩形对象
     * 
     * @param left - 左上角的 x 坐标（整数）
     * @param top - 左上角的 y 坐标（整数）
     * @param right - 右下角的 x 坐标（整数）
     * @param bottom - 右下角的 y 坐标（整数）
     * @returns 返回 IRect 对象
     */
    LTRBiRect(left: number, top: number, right: number, bottom: number): IRect;

    /**
     * 使用给定整数参数返回整数矩形对象
     * 
     * @param x - 左上角的 x 坐标（整数）
     * @param y - 左上角的 y 坐标（整数）
     * @param width - 矩形的宽度（整数）
     * @param height - 矩形的高度（整数）
     * @returns 返回 IRect 对象
     */
    XYWHiRect(x: number, y: number, width: number, height: number): IRect;

    /**
     * 返回具有圆角的矩形，由给定矩形和四个角相同的 radiusX 和 radiusY 组成
     * 
     * @param rect - 基础矩形
     * @param rx - x 方向的角半径
     * @param ry - y 方向的角半径
     * @returns 返回 RRect（圆角矩形）对象
     * 
     * 用法示例:
     * ```typescript
     * const rect = CanvasKit.XYWHRect(10, 10, 100, 50);
     * const roundedRect = CanvasKit.RRectXY(rect, 10, 10);
     * // 创建一个圆角半径为10的圆角矩形
     * ```
     */
    RRectXY(rect: InputRect, rx: number, ry: number): RRect;

    // ================== 阴影相关方法 ==================

    /**
     * 生成相对于路径的阴影边界框
     * 包括环境阴影和聚光阴影边界，与 Canvas.drawShadow() 配合使用
     * 
     * @param ctm - 到设备空间的当前变换矩阵
     * @param path - 用于生成阴影的遮挡物
     * @param zPlaneParams - 平面函数的值，根据本地 x 和 y 值返回遮挡物从画布的 Z 偏移
     * @param lightPos - 相对于画布平面的光源 3D 位置
     * @param lightRadius - 圆盘光源的半径
     * @param flags - 选项标志，0 表示使用默认选项
     * @param dstRect - 如果提供，边界将被复制到此矩形而不是分配新的
     * @returns 返回边界矩形，如果无法计算则返回 null
     * 
     * 用法示例:
     * ```typescript
     * const path = new CanvasKit.Path();
     * path.addRect([10, 10, 100, 100]);
     * 
     * const bounds = CanvasKit.getShadowLocalBounds(
     *   CanvasKit.Matrix.identity(),
     *   path,
     *   [0, 0, 1], // zPlaneParams
     *   [50, 50, 100], // lightPos
     *   25, // lightRadius
     *   0 // flags
     * );
     * ```
     */
    getShadowLocalBounds(ctm: InputMatrix, path: Path, zPlaneParams: InputVector3,
                         lightPos: InputVector3, lightRadius: number, flags: number,
                         dstRect?: Rect): Rect | null;

    // ================== 内存管理方法 ==================

    /**
     * Malloc 返回由给定长度的 C++ 内存支持的 TypedArray
     * 只应由能够管理内存和正确初始化值的高级用户使用
     * 正确使用时，可以节省 JS 和 C++ 之间的数据复制
     * 错误使用时，可能导致内存泄漏
     * 任何由 CanvasKit.Malloc 分配的内存都需要用 CanvasKit.Free 释放
     *
     * @param typedArray - TypedArray 的构造函数
     * @param len - 要存储的*元素*数量
     * @returns 返回 MallocObj 对象
     * 
     * 用法示例:
     * ```typescript
     * const mObj = CanvasKit.Malloc(Float32Array, 20);
     * // 获取围绕已分配内存的 TypedArray 视图（这不会复制任何东西）
     * const ta = mObj.toTypedArray();
     * // 将数据存储到 ta 中
     * const cf = CanvasKit.ColorFilter.MakeMatrix(ta);
     * 
     * // 最终...
     * CanvasKit.Free(mObj);
     * ```
     */
    Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj;

    /**
     * 与 Malloc 类似，但专门用于 GlyphID
     * 此辅助函数确保 JS 端和 C++ 端对 GlyphID 宽度保持一致
     * 
     * @param len - 要为其分配空间的 GlyphID 数量
     * @returns 返回 MallocObj 对象
     */
    MallocGlyphIDs(len: number): MallocObj;

    /**
     * 释放由 Malloc 返回的内存
     * 任何由 CanvasKit.Malloc 分配的内存都需要用 CanvasKit.Free 释放
     * 
     * @param m - 要释放的 MallocObj
     * 
     * 用法示例:
     * ```typescript
     * const mObj = CanvasKit.Malloc(Float32Array, 100);
     * // ... 使用 mObj
     * CanvasKit.Free(mObj); // 释放内存
     * ```
     */
    Free(m: MallocObj): void;

    // ================== Surface 相关函数 ==================

    /**
     * 在给定画布上创建 Surface
     * 如果编译了 GPU 和 CPU 模式，将首先尝试创建 GPU surface，失败时回退到 CPU
     * 如果只编译了 CPU 模式，将创建 CPU surface
     * 
     * @param canvas - 画布元素或其 DOM ID 字符串
     * @returns 返回 Surface 对象或 null
     * @deprecated 使用 MakeSWCanvasSurface、MakeWebGLCanvasSurface 或 MakeGPUCanvasSurface
     * 
     * 用法示例:
     * ```typescript
     * const canvas = document.getElementById('myCanvas');
     * const surface = CanvasKit.MakeCanvasSurface(canvas);
     * ```
     */
    MakeCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string): Surface | null;

    /**
     * 创建将绘制到提供的 Malloc 缓冲区的光栅（CPU）Surface
     * 允许客户端有效地读取当前像素而无需复制
     * pixels 的长度必须至少为 height * bytesPerRow 字节
     * 
     * @param ii - 图像信息对象
     * @param pixels - 像素缓冲区
     * @param bytesPerRow - 每行的字节数
     * @returns 返回 Surface 对象或 null
     */
    MakeRasterDirectSurface(ii: ImageInfo, pixels: MallocObj, bytesPerRow: number): Surface | null;

    /**
     * 创建 CPU 支持的（即光栅）surface
     * 
     * @param canvas - 画布元素或其 DOM ID 字符串
     * @returns 返回 Surface 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const surface = CanvasKit.MakeSWCanvasSurface('myCanvas');
     * ```
     */
    MakeSWCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string): Surface | null;

    /**
     * 创建 WebGL 支持的（即 GPU）surface 的辅助函数，如果无法创建 GPU surface 则回退到 CPU surface
     * 适用于 WebGL 1 和 WebGL 2
     * 
     * @param canvas - 画布元素或其 DOM ID 字符串
     * @param colorSpace - 支持的色彩空间之一，默认为 SRGB
     * @param opts - 传递给 WebGL 上下文创建的选项
     * @returns 返回 Surface 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const surface = CanvasKit.MakeWebGLCanvasSurface('myCanvas', 
     *   CanvasKit.ColorSpace.SRGB, 
     *   { antialias: true, alpha: false }
     * );
     * ```
     */
    MakeWebGLCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string,
                           colorSpace?: ColorSpace,
                           opts?: WebGLOptions): Surface | null;

    /**
     * 返回具有给定尺寸的 CPU 支持的 surface
     * 使用 SRGB 色彩空间、未预乘 alpha 类型和 8888 颜色类型
     * 属于此 surface 的像素将在内存中且不可见
     * 
     * @param width - 可绘制区域的宽度像素数
     * @param height - 可绘制区域的高度像素数
     * @returns 返回 Surface 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const surface = CanvasKit.MakeSurface(800, 600);
     * ```
     */
    MakeSurface(width: number, height: number): Surface | null;

    /**
     * 从给定画布使用给定选项创建 WebGL 上下文
     * 如果省略选项，将使用合理的默认值
     * 
     * @param canvas - 画布元素
     * @param opts - WebGL 选项
     * @returns 返回 WebGL 上下文句柄
     */
    GetWebGLContext(canvas: HTMLCanvasElement | OffscreenCanvas,
                    opts?: WebGLOptions): WebGLContextHandle;

    /**
     * 从给定的 WebGL 上下文创建 GrDirectContext
     * 
     * @param ctx - WebGL 上下文句柄
     * @returns 返回 GrDirectContext 或 null
     * @deprecated 使用 MakeWebGLContext 代替
     */
    MakeGrContext(ctx: WebGLContextHandle): GrDirectContext | null;

    /**
     * 从给定的 WebGL 上下文创建 GrDirectContext
     * 
     * @param ctx - WebGL 上下文句柄
     * @returns 返回 GrDirectContext 或 null
     */
    MakeWebGLContext(ctx: WebGLContextHandle): GrDirectContext | null;

    /**
     * 创建将绘制到给定 GrDirectContext 的 Surface（并显示在屏幕上）
     * 
     * @param ctx - Graphics 上下文
     * @param width - 可见区域的宽度像素数
     * @param height - 可见区域的高度像素数
     * @param colorSpace - 色彩空间
     * @param sampleCount - GL_SAMPLES 的采样计数值
     * @param stencil - GL_STENCIL_BITS 的模板计数值
     * @returns 返回 Surface 对象或 null
     */
    MakeOnScreenGLSurface(ctx: GrDirectContext, width: number, height: number,
                          colorSpace: ColorSpace, sampleCount?: number, stencil?: number): Surface | null;

    /**
     * 创建在给定 WebGPU 设备上操作的上下文
     * 
     * @param device - WebGPU 设备
     * @returns 返回 WebGPU 设备上下文或 null
     */
    MakeGPUDeviceContext(device: GPUDevice): WebGPUDeviceContext | null;

    /**
     * 创建绘制到给定 GPU 纹理的 Surface
     * 
     * @param ctx - WebGPU 设备上下文
     * @param texture - 在与 ctx 关联的 GPU 设备上创建的纹理
     * @param width - 可见区域的宽度（像素）
     * @param height - 可见区域的高度（像素）
     * @param colorSpace - 色彩空间
     * @returns 返回 Surface 对象或 null
     */
    MakeGPUTextureSurface(ctx: WebGPUDeviceContext, texture: GPUTexture, width: number, height: number,
                          colorSpace: ColorSpace): Surface | null;

    /**
     * 为给定画布创建和配置 WebGPU 上下文
     * 
     * @param ctx - WebGPU 设备上下文
     * @param canvas - HTML 画布元素
     * @param opts - WebGPU 画布选项
     * @returns 返回 WebGPU 画布上下文或 null
     */
    MakeGPUCanvasContext(ctx: WebGPUDeviceContext, canvas: HTMLCanvasElement,
                         opts?: WebGPUCanvasOptions): WebGPUCanvasContext | null;

    /**
     * 创建由与给定 WebGPU 画布上下文关联的交换链中下一个可用纹理支持的 Surface
     * 
     * @param canvasContext - 与画布关联的 WebGPU 上下文
     * @param colorSpace - 色彩空间
     * @param width - 可见区域的宽度
     * @param height - 可见区域的高度
     * @returns 返回 Surface 对象或 null
     */
    MakeGPUCanvasSurface(canvasContext: WebGPUCanvasContext, colorSpace: ColorSpace,
                         width?: number, height?: number): Surface | null;

    /**
     * 返回 GPU 上的（不可见）Surface，具有给定尺寸并使用 8888 颜色深度和预乘 alpha
     * 
     * @param ctx - Graphics 上下文
     * @param width - 宽度
     * @param height - 高度
     * @returns 返回 Surface 对象或 null
     */
    MakeRenderTarget(ctx: GrDirectContext, width: number, height: number): Surface | null;

    /**
     * 返回 GPU 上的（不可见）Surface，具有图像信息提供的设置
     * 
     * @param ctx - Graphics 上下文
     * @param info - 图像信息
     * @returns 返回 Surface 对象或 null
     */
    MakeRenderTarget(ctx: GrDirectContext, info: ImageInfo): Surface | null;

    /**
     * 基于 src 中的内容返回纹理支持的图像
     * 假设图像是 RGBA_8888、未预乘和 SRGB。此图像可以在多个 surface 上重复使用
     * 
     * @param src - 纹理源，CanvasKit 将获取所有权并在图像销毁时清理它
     * @param info - 如果提供，将用于确定源图像的宽度/高度/格式
     * @param srcIsPremul - 如果 src 数据具有预乘 alpha，则设置为 true
     * @returns 返回 Image 对象
     */
    MakeLazyImageFromTextureSource(src: TextureSource, info?: ImageInfo | PartialImageInfo,
                                   srcIsPremul?: boolean): Image;

    /**
     * 删除关联的 WebGL 上下文。CPU 版本不可用
     * 
     * @param ctx - WebGL 上下文句柄
     */
    deleteContext(ctx: WebGLContextHandle): void;

    // ================== 缓存管理方法 ==================

    /**
     * 返回 CanvasKit 使用的位图全局缓存的最大大小
     * 
     * @returns 返回缓存限制（字节）
     */
    getDecodeCacheLimitBytes(): number;

    /**
     * 返回 CanvasKit 使用的位图全局缓存的当前大小
     * 
     * @returns 返回当前缓存使用量（字节）
     */
    getDecodeCacheUsedBytes(): number;

    /**
     * 设置 CanvasKit 使用的位图全局缓存的最大大小
     * 
     * @param size - 可用于缓存位图的字节数
     */
    setDecodeCacheLimitBytes(size: number): void;

    // ================== 图像和动画创建方法 ==================

    /**
     * 将给定字节解码为动画图像
     * 如果字节无效则返回 null
     * 传入的字节将被复制到 WASM 堆中，因此调用者可以处理它们
     * 
     * @param bytes - 图像数据字节
     * @returns 返回 AnimatedImage 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const response = await fetch('animated.gif');
     * const bytes = await response.arrayBuffer();
     * const animatedImage = CanvasKit.MakeAnimatedImageFromEncoded(bytes);
     * ```
     */
    MakeAnimatedImageFromEncoded(bytes: Uint8Array | ArrayBuffer): AnimatedImage | null;

    /**
     * 返回给定大小的模拟 Canvas2D
     * 
     * @param width - 画布宽度
     * @param height - 画布高度
     * @returns 返回 EmulatedCanvas2D 对象
     */
    MakeCanvas(width: number, height: number): EmulatedCanvas2D;

    /**
     * 使用给定的像素数据和格式返回图像
     * 注意：我们总是会复制像素数据，因为 GPU 和 CPU 之间的行为不一致
     * 
     * @param info - 图像信息
     * @param bytes - 表示像素数据的字节
     * @param bytesPerRow - 每行字节数
     * @returns 返回 Image 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const imageInfo = {
     *   width: 100,
     *   height: 100,
     *   colorType: CanvasKit.ColorType.RGBA_8888,
     *   alphaType: CanvasKit.AlphaType.Unpremul
     * };
     * const pixels = new Uint8Array(100 * 100 * 4); // RGBA 数据
     * const image = CanvasKit.MakeImage(imageInfo, pixels, 100 * 4);
     * ```
     */
    MakeImage(info: ImageInfo, bytes: number[] | Uint8Array | Uint8ClampedArray,
              bytesPerRow: number): Image | null;

    /**
     * 返回由编码数据支持的图像，但尝试延迟解码直到实际使用/绘制图像
     * 这种延迟允许系统缓存结果，无论是在 CPU 还是 GPU 上
     * 
     * @param bytes - 编码的图像数据
     * @returns 返回 Image 对象或 null
     * 
     * 用法示例:
     * ```typescript
     * const response = await fetch('image.png');
     * const bytes = await response.arrayBuffer();
     * const image = CanvasKit.MakeImageFromEncoded(bytes);
     * ```
     */
    MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): Image | null;

    /**
     * 使用提供的 CanvasImageSource（例如 <img>）中的数据返回图像
     * 这将使用浏览器的内置编解码器
     * 
     * @param src - 画布图像源
     * @returns 返回 Image 对象
     * 
     * 用法示例:
     * ```typescript
     * const imgElement = document.getElementById('myImage');
     * const image = CanvasKit.MakeImageFromCanvasImageSource(imgElement);
     * ```
     */
    MakeImageFromCanvasImageSource(src: CanvasImageSource): Image;

    /**
     * 返回先前序列化为给定字节的 SkPicture
     * 
     * @param bytes - 序列化的 Picture 数据
     * @returns 返回 SkPicture 对象或 null
     */
    MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null;

    /**
     * 基于给定位置和可选参数返回顶点对象
     * 
     * @param mode - 顶点模式
     * @param positions - 顶点位置
     * @param textureCoordinates - 纹理坐标
     * @param colors - 颜色（整数颜色列表或扁平化颜色数组）
     * @param indices - 索引
     * @param isVolatile - 是否易失
     * @returns 返回 Vertices 对象
     * 
     * 用法示例:
     * ```typescript
     * const vertices = CanvasKit.MakeVertices(
     *   CanvasKit.VertexMode.Triangles,
     *   [0, 0, 100, 0, 50, 100], // 三角形顶点
     *   null, // 无纹理坐标
     *   [0xFF0000FF, 0x00FF00FF, 0x0000FFFF], // 红绿蓝颜色
     *   null, // 无索引
     *   false // 非易失
     * );
     * ```
     */
    MakeVertices(mode: VertexMode, positions: InputFlattenedPointArray,
                 textureCoordinates?: InputFlattenedPointArray | null,
                 colors?: Float32Array | ColorIntArray | null, indices?: number[] | null,
                 isVolatile?: boolean): Vertices;

    // ================== Skottie 动画方法 ==================

    /**
     * 从提供的 JSON 字符串构建 Skottie 动画
     * 需要将 Skottie 编译到 CanvasKit 中
     * 注意：此动画将无法显示文本或图像
     * 
     * @param json - Lottie 动画的 JSON 字符串
     * @returns 返回 SkottieAnimation 对象
     * 
     * 用法示例:
     * ```typescript
     * const animationJson = '{"v":"5.5.7","fr":29.97,...}'; // Lottie JSON
     * const animation = CanvasKit.MakeAnimation(animationJson);
     * ```
     */
    MakeAnimation(json: string): SkottieAnimation;

    /**
     * 从提供的 JSON 字符串和资源构建托管的 Skottie 动画
     * 需要将 Skottie 编译到 CanvasKit 中
     * 
     * @param json - Lottie 动画的 JSON 字符串
     * @param assets - 命名 blob 字典：{ key: ArrayBuffer, ... }
     * @param filterPrefix - 可选字符串，用作名称过滤器选择"有趣的" Lottie 属性
     * @param soundMap - 声音标识符到 AudioPlayer 的可选映射
     * @returns 返回 ManagedSkottieAnimation 对象
     * 
     * 用法示例:
     * ```typescript
     * const animation = CanvasKit.MakeManagedAnimation(
     *   animationJson,
     *   { 'image1.png': imageArrayBuffer }, // 资源
     *   'button_', // 过滤前缀
     *   { 'click_sound': audioPlayer } // 声音映射
     * );
     * ```
     */
    MakeManagedAnimation(json: string, assets?: Record<string, ArrayBuffer>,
                         filterPrefix?: string, soundMap?: SoundMap): ManagedSkottieAnimation;

    // ================== 构造函数 ==================
    // 用 `new CanvasKit.Foo()` 创建的对象

    readonly ImageData: ImageDataConstructor;
    readonly ParagraphStyle: ParagraphStyleConstructor;
    readonly ContourMeasureIter: ContourMeasureIterConstructor;
    readonly Font: FontConstructor;
    readonly Paint: DefaultConstructor<Paint>;
    readonly Path: PathConstructorAndFactory;
    readonly PictureRecorder: DefaultConstructor<PictureRecorder>;
    readonly TextStyle: TextStyleConstructor;
    readonly SlottableTextProperty: SlottableTextPropertyConstructor;

    // ================== 工厂方法 ==================
    // 用 CanvasKit.Foo.MakeSomething() 创建的对象

    readonly ParagraphBuilder: ParagraphBuilderFactory;
    readonly Blender: BlenderFactory;
    readonly ColorFilter: ColorFilterFactory;
    readonly FontCollection: FontCollectionFactory;
    readonly FontMgr: FontMgrFactory;
    readonly ImageFilter: ImageFilterFactory;
    readonly MaskFilter: MaskFilterFactory;
    readonly PathEffect: PathEffectFactory;
    readonly RuntimeEffect: RuntimeEffectFactory;
    readonly Shader: ShaderFactory;
    readonly TextBlob: TextBlobFactory;
    readonly Typeface: TypefaceFactory;
    readonly TypefaceFontProvider: TypefaceFontProviderFactory;

    // ================== 辅助工具 ==================

    readonly ColorMatrix: ColorMatrixHelpers;
    readonly Matrix: Matrix3x3Helpers;
    readonly M44: Matrix4x4Helpers;
    readonly Vector: VectorHelpers;

    // ================== 核心枚举 ==================

    readonly AlphaType: AlphaTypeEnumValues;
    readonly BlendMode: BlendModeEnumValues;
    readonly BlurStyle: BlurStyleEnumValues;
    readonly ClipOp: ClipOpEnumValues;
    readonly ColorChannel: ColorChannelEnumValues;
    readonly ColorType: ColorTypeEnumValues;
    readonly FillType: FillTypeEnumValues;
    readonly FilterMode: FilterModeEnumValues;
    readonly FontEdging: FontEdgingEnumValues;
    readonly FontHinting: FontHintingEnumValues;
    readonly GlyphRunFlags: GlyphRunFlagValues;
    readonly ImageFormat: ImageFormatEnumValues;
    readonly MipmapMode: MipmapModeEnumValues;
    readonly PaintStyle: PaintStyleEnumValues;
    readonly Path1DEffect: Path1DEffectStyleEnumValues;
    readonly PathOp: PathOpEnumValues;
    readonly PointMode: PointModeEnumValues;
    readonly ColorSpace: ColorSpaceEnumValues;
    readonly StrokeCap: StrokeCapEnumValues;
    readonly StrokeJoin: StrokeJoinEnumValues;
    readonly TileMode: TileModeEnumValues;
    readonly VertexMode: VertexModeEnumValues;
    readonly InputState: InputStateEnumValues;
    readonly ModifierKey: ModifierKeyEnumValues;

    // ================== 核心常量 ==================

    /** 透明色常量 */
    readonly TRANSPARENT: Color;
    /** 黑色常量 */
    readonly BLACK: Color;
    /** 白色常量 */
    readonly WHITE: Color;
    /** 红色常量 */
    readonly RED: Color;
    /** 绿色常量 */
    readonly GREEN: Color;
    /** 蓝色常量 */
    readonly BLUE: Color;
    /** 黄色常量 */
    readonly YELLOW: Color;
    /** 青色常量 */
    readonly CYAN: Color;
    /** 洋红色常量 */
    readonly MAGENTA: Color;

    // 路径动词常量
    readonly MOVE_VERB: number;
    readonly LINE_VERB: number;
    readonly QUAD_VERB: number;
    readonly CONIC_VERB: number;
    readonly CUBIC_VERB: number;
    readonly CLOSE_VERB: number;

    // 保存图层标志
    readonly SaveLayerInitWithPrevious: SaveLayerFlag;
    readonly SaveLayerF16ColorType: SaveLayerFlag;

    // 阴影标志
    /**
     * 使用此阴影标志表示遮挡对象不是不透明的
     * 知道遮挡物是不透明的允许我们剔除其后面的阴影几何体并提高性能
     */
    readonly ShadowTransparentOccluder: number;
    /**
     * 使用此阴影标志不使用分析阴影
     */
    readonly ShadowGeometricOnly: number;
    /**
     * 使用此阴影标志表示光位置表示方向，光半径是海拔 1 处的模糊半径
     */
    readonly ShadowDirectionalLight: number;

    // 编译标志
    readonly gpu?: boolean; // 如果编译了 GPU 代码则为 true
    readonly managed_skottie?: boolean; // 如果编译了高级（托管）Skottie 代码则为 true
    readonly rt_effect?: boolean; // 如果编译了 RuntimeEffect 则为 true
    readonly skottie?: boolean; // 如果编译了基础 Skottie 代码则为 true

    // ================== 段落枚举 ==================

    readonly Affinity: AffinityEnumValues;
    readonly DecorationStyle: DecorationStyleEnumValues;
    readonly FontSlant: FontSlantEnumValues;
    readonly FontWeight: FontWeightEnumValues;
    readonly FontWidth: FontWidthEnumValues;
    readonly PlaceholderAlignment: PlaceholderAlignmentEnumValues;
    readonly RectHeightStyle: RectHeightStyleEnumValues;
    readonly RectWidthStyle: RectWidthStyleEnumValues;
    readonly TextAlign: TextAlignEnumValues;
    readonly TextBaseline: TextBaselineEnumValues;
    readonly TextDirection: TextDirectionEnumValues;
    readonly TextHeightBehavior: TextHeightBehaviorEnumValues;

    // 其他枚举
    readonly VerticalTextAlign: VerticalTextAlignEnumValues;
    readonly ResizePolicy: ResizePolicyEnumValues;

    // ================== 段落常量 ==================

    readonly NoDecoration: number;
    readonly UnderlineDecoration: number;
    readonly OverlineDecoration: number;
    readonly LineThroughDecoration: number;

    // Unicode 枚举
    readonly CodeUnitFlags: CodeUnitFlagsEnumValues;
}

// ================== 核心接口定义 ==================

/**
 * 摄像机接口
 * 定义 3D 场景中摄像机的位置、方向和视野参数
 */
export interface Camera {
    /** 
     * 定位摄像机的 3D 点
     * 摄像机在 3D 空间中的位置坐标
     */
    eye: Vector3;
    
    /** 
     * 注意中心 - 摄像机正在查看的 3D 点
     * 摄像机视线的目标点
     */
    coa: Vector3;
    
    /**
     * 指向摄像机向上方向的单位向量
     * 注意：仅使用 eye 和 coa 会使摄像机的滚转未指定
     * 此向量定义了摄像机的"上"方向，防止画面旋转
     */
    up: Vector3;
    
    /** 近裁剪平面距离 */
    near: number;
    
    /** 远裁剪平面距离 */
    far: number;
    
    /** 视野角度（弧度） */
    angle: AngleInRadians;
}

/**
 * CanvasKit 使用 Emscripten 和 Embind 构建
 * Embind 为所有通过它暴露的对象添加以下方法
 * 此 _type 字段对于 TypeScript 编译器区分不透明类型（如 Shader 和 ColorFilter）是必需的
 * 它在运行时不存在
 */
export interface EmbindObject<T extends string> {
    _type: T;
    
    /**
     * 立即删除此对象
     * 释放与此对象关联的所有 C++ 内存
     */
    delete(): void;
    
    /**
     * 标记此对象以便稍后删除
     * 在下一个垃圾回收周期中删除对象
     */
    deleteLater(): void;
    
    /**
     * 检查此对象是否是另一个对象的别名
     * @param other - 要比较的其他对象
     * @returns 如果是别名则返回 true
     */
    isAliasOf(other: any): boolean;
    
    /**
     * 检查此对象是否已被删除
     * @returns 如果对象已删除则返回 true
     */
    isDeleted(): boolean;
}

/**
 * 表示枚举值集合的接口
 */
export interface EmbindEnum {
    /** 所有枚举值的只读数组 */
    readonly values: number[];
}

/**
 * 表示枚举的单个成员
 */
export interface EmbindEnumEntity {
    /** 枚举成员的数值 */
    readonly value: number;
}

/**
 * 模拟的 Canvas2D 接口
 * 提供与标准 Canvas2D API 类似的功能
 */
export interface EmulatedCanvas2D {
    /**
     * 清理与此模拟画布关联的所有资源
     * 使用完毕后应调用此方法以防止内存泄漏
     * 
     * 用法示例:
     * ```typescript
     * const canvas = CanvasKit.MakeCanvas(800, 600);
     * // 使用画布...
     * canvas.dispose(); // 清理资源
     * ```
     */
    dispose(): void;
    
    /**
     * 使用给定字节解码图像
     * 
     * @param bytes - 图像数据字节
     * @returns 返回解码后的 Image 对象
     * 
     * 用法示例:
     * ```typescript
     * const response = await fetch('image.png');
     * const bytes = await response.arrayBuffer();
     * const image = canvas.decodeImage(bytes);
     * ```
     */
    decodeImage(bytes: ArrayBuffer | Uint8Array): Image;

    /**
     * 如果 type == '2d' 则返回模拟的 canvas2d 上下文，否则返回 null
     * 
     * @param type - 上下文类型字符串
     * @returns 返回上下文或 null
     * 
     * 用法示例:
     * ```typescript
     * const ctx = canvas.getContext('2d');
     * if (ctx) {
     *   // 使用 2D 渲染上下文
     * }
     * ```
     */
    getContext(type: string): EmulatedCanvas2DContext | null;

    /**
     * 使用给定描述符加载给定字体。模拟 new FontFace()
     * 
     * @param bytes - 字体文件字节
     * @param descriptors - 字体描述符记录
     * 
     * 用法示例:
     * ```typescript
     * const fontBytes = await fetch('font.ttf').then(r => r.arrayBuffer());
     * canvas.loadFont(fontBytes, {
     *   'family': 'MyFont',
     *   'style': 'normal',
     *   'weight': '400'
     * });
     * ```
     */
    loadFont(bytes: ArrayBuffer | Uint8Array, descriptors: Record<string, string>): void;

    /**
     * 返回新的模拟 Path2D 对象
     * 
     * @param str - 表示路径的 SVG 字符串
     * @returns 返回 EmulatedPath2D 对象
     * 
     * 用法示例:
     * ```typescript
     * const path = canvas.makePath2D('M 10 10 L 100 100');
     * // 或者
     * const emptyPath = canvas.makePath2D();
     * ```
     */
    makePath2D(str?: string): EmulatedPath2D;

    /**
     * 将当前画布作为 base64 编码的图像字符串返回
     * 
     * @param codec - 图像编码格式，默认为 image/png；也支持 image/jpeg
     * @param quality - 图像质量（用于 JPEG）
     * @returns 返回 base64 编码的图像字符串
     * 
     * 用法示例:
     * ```typescript
     * const pngDataUrl = canvas.toDataURL(); // PNG 格式
     * const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8); // JPEG 格式，质量 80%
     * ```
     */
    toDataURL(codec?: string, quality?: number): string;
}

/** Canvas2D 模拟代码的一部分 */
export type EmulatedCanvas2DContext = CanvasRenderingContext2D;
export type EmulatedImageData = ImageData;
export type EmulatedPath2D = Path2D;

/**
 * 字体样式接口
 * 定义字体的外观属性
 */
export interface FontStyle {
    /** 字体粗细 */
    weight?: FontWeight;
    /** 字体宽度 */
    width?: FontWidth;
    /** 字体倾斜度 */
    slant?: FontSlant;
}

/**
 * Graphics Direct Context 接口
 * 管理 GPU 渲染上下文和资源
 * 更多信息请参见 GrDirectContext.h
 */
export interface GrDirectContext extends EmbindObject<"GrDirectContext"> {
    /**
     * 获取资源缓存限制字节数
     * @returns 返回缓存限制（字节）
     */
    getResourceCacheLimitBytes(): number;
    
    /**
     * 获取资源缓存使用字节数
     * @returns 返回当前缓存使用量（字节）
     */
    getResourceCacheUsageBytes(): number;
    
    /**
     * 释放资源并放弃上下文
     * 强制释放所有 GPU 资源，上下文将不再可用
     */
    releaseResourcesAndAbandonContext(): void;
    
    /**
     * 设置资源缓存限制字节数
     * @param bytes - 新的缓存限制（字节）
     */
    setResourceCacheLimitBytes(bytes: number): void;
}

/**
 * 表示由 WebGPU 设备实例支持的上下文
 */
export type WebGPUDeviceContext = GrDirectContext;

/**
 * 表示由 WebGPU 设备支持的画布上下文和交换链
 */
export interface WebGPUCanvasContext {
    /**
     * 在与画布元素关联的交换链纹理序列上绘制多帧的便捷方法
     * 每次调用都会在内部构造一个针对交换链中当前 GPUTexture 的新 Surface
     * 
     * 这需要一个可用全局函数 requestAnimationFrame 的环境（例如在 Web 上，而不是 Node 上）
     * 一旦 `drawFrame` 回调返回，内部创建的 surface 会自动刷新和销毁
     * 
     * 用户可以在回调函数中调用 canvasContext.requestAnimationFrame 来绘制多帧，例如动画
     * 
     * @param drawFrame - 绘制帧的回调函数，接收 Canvas 参数
     * 
     * 用法示例:
     * ```typescript
     * canvasContext.requestAnimationFrame((canvas) => {
     *   const paint = new CanvasKit.Paint();
     *   paint.setColor(CanvasKit.Color(255, 0, 0));
     *   canvas.drawRect([10, 10, 100, 100], paint);
     *   
     *   // 继续动画
     *   canvasContext.requestAnimationFrame(drawFrame);
     * });
     * ```
     */
    requestAnimationFrame(drawFrame: (_: Canvas) => void): void;
}

/**
 * Canvas 绘图接口
 * CanvasKit 的核心绘图接口，提供所有绘图操作
 * 更多信息请参见 SkCanvas.h
 */
export interface Canvas extends EmbindObject<"Canvas"> {
    /**
     * 使用 Src 混合模式用给定颜色填充当前裁剪区域
     * @param color - 填充颜色
     */
    clear(color: InputColor): void;

    /**
     * 绘制圆形
     * @param cx - 圆心 x 坐标
     * @param cy - 圆心 y 坐标  
     * @param radius - 半径
     * @param paint - 绘画样式
     */
    drawCircle(cx: number, cy: number, radius: number, paint: Paint): void;

    /**
     * 绘制图像
     * @param img - 要绘制的图像
     * @param left - 左侧位置
     * @param top - 顶部位置
     * @param paint - 可选的绘画样式
     */
    drawImage(img: Image, left: number, top: number, paint?: Paint | null): void;

    /**
     * 使用立方采样绘制图像
     * @param img - 要绘制的图像
     * @param left - 左侧位置
     * @param top - 顶部位置
     * @param B - 立方重采样参数 B
     * @param C - 立方重采样参数 C
     * @param paint - 可选的绘画样式
     */
    drawImageCubic(img: Image, left: number, top: number, B: number, C: number,
                   paint?: Paint | null): void;

    /**
     * 使用选项绘制图像
     * @param img - 要绘制的图像
     * @param left - 左侧位置
     * @param top - 顶部位置
     * @param fm - 过滤模式
     * @param mm - mipmap 模式
     * @param paint - 可选的绘画样式
     */
    drawImageOptions(img: Image, left: number, top: number, fm: FilterMode,
                     mm: MipmapMode, paint?: Paint | null): void;

    /**
     * 绘制图像到指定矩形
     * @param img - 要绘制的图像
     * @param src - 源矩形
     * @param dest - 目标矩形
     * @param paint - 绘画样式
     * @param fastSample - 是否使用快速采样
     */
    drawImageRect(img: Image, src: InputRect, dest: InputRect, paint: Paint, fastSample?: boolean): void;

    /**
     * 使用立方采样绘制图像矩形
     * @param img - 要绘制的图像
     * @param src - 源矩形
     * @param dest - 目标矩形
     * @param B - 立方重采样参数 B
     * @param C - 立方重采样参数 C
     * @param paint - 可选的绘画样式
     */
    drawImageRectCubic(img: Image, src: InputRect, dest: InputRect,
                       B: number, C: number, paint?: Paint | null): void;

    /**
     * 使用选项绘制图像矩形
     * @param img - 要绘制的图像
     * @param src - 源矩形
     * @param dest - 目标矩形
     * @param fm - 过滤模式
     * @param mm - mipmap 模式
     * @param paint - 可选的绘画样式
     */
    drawImageRectOptions(img: Image, src: InputRect, dest: InputRect, fm: FilterMode,
                         mm: MipmapMode, paint?: Paint | null): void;

    /**
     * 绘制图像的九宫格
     * @param img - 要绘制的图像
     * @param center - 中心矩形
     * @param dest - 目标矩形
     * @param filter - 过滤器
     * @param paint - 绘画样式
     */
    drawImageNine(img: Image, center: InputIRect, dest: InputRect, filter: FilterMode, paint?: Paint | null): void;

    /**
     * 绘制立方体贴片
     * 由 12 个控制点定义的立方体贴片 [顶部、右侧、底部、左侧]
     * @param cubics - 12 个点：指定贴片边界的 4 个连接立方体
     * @param colors - 可选的颜色，在贴片上插值
     * @param texs - 可选的着色器坐标，在贴片上插值
     * @param mode - 指定着色器和颜色如何混合（如果两者都指定）
     * @param paint - 绘画样式
     */
    drawPatch(cubics: InputFlattenedPointArray,
              colors?: ColorIntArray | Color[] | null,
              texs?: InputFlattenedPointArray | null,
              mode?: BlendMode | null,
              paint?: Paint): void;

    /**
     * 绘制图片
     * 使用当前裁剪、当前矩阵和提供的绘画样式绘制给定图片
     * @param skp - 图片对象
     */
    drawPicture(skp: SkPicture): void;

    /**
     * 绘制点
     * 使用当前裁剪、当前矩阵和提供的绘画样式绘制给定点
     * @param mode - 点模式
     * @param points - 点数组
     * @param paint - 绘画样式
     */
    drawPoints(mode: PointMode, points: InputFlattenedPointArray, paint: Paint): void;

    /**
     * 绘制矩形（四个浮点数参数）
     * @param left - 左边界
     * @param top - 上边界
     * @param right - 右边界
     * @param bottom - 下边界
     * @param paint - 绘画样式
     */
    drawRect4f(left: number, top: number, right: number, bottom: number, paint: Paint): void;

    /**
     * 绘制路径
     * @param path - 要绘制的路径
     * @param paint - 绘画样式
     */
    drawPath(path: Path, paint: Paint): void;

    /**
     * 绘制矩形
     * @param rect - 要绘制的矩形
     * @param paint - 绘画样式
     */
    drawRect(rect: InputRect, paint: Paint): void;

    /**
     * 绘制文本
     * @param str - 要绘制的文本字符串
     * @param x - x 坐标
     * @param y - y 坐标
     * @param paint - 绘画样式
     * @param font - 字体
     */
    drawText(str: string, x: number, y: number, paint: Paint, font: Font): void;

    /**
     * 保存当前的矩阵和裁剪状态
     * @returns 返回当前堆栈高度
     */
    save(): number;

    /**
     * 恢复之前保存的状态
     */
    restore(): void;

    /**
     * 缩放当前矩阵
     * @param sx - x 轴缩放因子
     * @param sy - y 轴缩放因子
     */
    scale(sx: number, sy: number): void;

    /**
     * 平移当前矩阵
     * @param dx - x 轴平移量
     * @param dy - y 轴平移量
     */
    translate(dx: number, dy: number): void;

    /**
     * 裁剪路径
     * 用当前裁剪和路径的交集或差集替换裁剪
     * @param path - 要裁剪的路径
     * @param op - 裁剪操作（交集、差集等）
     * @param doAntiAlias - 是否使用抗锯齿
     */
    clipPath(path: Path, op: ClipOp, doAntiAlias: boolean): void;

    /**
     * 裁剪矩形
     * @param rect - 要裁剪的矩形
     * @param op - 裁剪操作
     * @param doAntiAlias - 是否使用抗锯齿
     */
    clipRect(rect: InputRect, op: ClipOp, doAntiAlias: boolean): void;

    /**
     * 连接变换矩阵
     * @param m - 要连接的变换矩阵
     */
    concat(m: InputMatrix): void;

    /**
     * 绘制弧形
     * @param oval - 包含弧的椭圆边界
     * @param startAngle - 起始角度（度）
     * @param sweepAngle - 扫描角度（度）
     * @param useCenter - 是否包含中心点
     * @param paint - 绘画样式
     */
    drawArc(oval: InputRect, startAngle: AngleInDegrees, sweepAngle: AngleInDegrees,
            useCenter: boolean, paint: Paint): void;

    /**
     * 用颜色填充裁剪区域
     * @param color - 填充颜色
     * @param blendMode - 混合模式，默认为 SrcOver
     */
    drawColor(color: InputColor, blendMode?: BlendMode): void;

    /**
     * 绘制线段
     * @param x0 - 起点 x 坐标
     * @param y0 - 起点 y 坐标
     * @param x1 - 终点 x 坐标
     * @param y1 - 终点 y 坐标
     * @param paint - 绘画样式
     */
    drawLine(x0: number, y0: number, x1: number, y1: number, paint: Paint): void;

    /**
     * 绘制椭圆
     * @param oval - 椭圆边界矩形
     * @param paint - 绘画样式
     */
    drawOval(oval: InputRect, paint: Paint): void;

    /**
     * 用指定的绘画样式填充裁剪区域
     * @param paint - 绘画样式
     */
    drawPaint(paint: Paint): void;

    /**
     * 绘制段落
     * 需要编译时包含 Paragraph 代码
     * @param p - 段落对象
     * @param x - x 坐标
     * @param y - y 坐标
     */
    drawParagraph(p: Paragraph, x: number, y: number): void;

    /**
     * 绘制圆角矩形
     * @param rrect - 要绘制的圆角矩形
     * @param paint - 绘画样式
     */
    drawRRect(rrect: InputRRect, paint: Paint): void;

    /**
     * 绘制阴影
     * @param path - 产生阴影的路径
     * @param zPlaneParams - Z平面参数
     * @param lightPos - 光源位置
     * @param lightRadius - 光源半径
     * @param ambientColor - 环境光颜色
     * @param spotColor - 聚光灯颜色
     * @param flags - 阴影标志
     */
    drawShadow(path: Path, zPlaneParams: InputVector3, lightPos: InputVector3, lightRadius: number,
               ambientColor: InputColor, spotColor: InputColor, flags: number): void;

    /**
     * 绘制文本块
     * @param blob - 文本块对象
     * @param x - x 坐标
     * @param y - y 坐标
     * @param paint - 绘画样式
     */
    drawTextBlob(blob: TextBlob, x: number, y: number, paint: Paint): void;

    /**
     * 绘制顶点
     * @param verts - 顶点对象
     * @param mode - 混合模式
     * @param paint - 绘画样式
     */
    drawVertices(verts: Vertices, mode: BlendMode, paint: Paint): void;

    /**
     * 获取设备裁剪边界
     * @param output - 输出矩形
     * @returns 设备裁剪边界
     */
    getDeviceClipBounds(output?: IRect): IRect;

    /**
     * 快速拒绝测试
     * @param rect - 测试矩形
     * @returns 如果矩形完全在裁剪外则返回 true
     */
    quickReject(rect: InputRect): boolean;

    /**
     * 获取本地到设备的变换矩阵
     * @returns 4x4 变换矩阵
     */
    getLocalToDevice(): Matrix4x4;

    /**
     * 获取保存计数
     * @returns 当前保存状态的数量
     */
    getSaveCount(): number;

    /**
     * 获取总变换矩阵（3x3 版本）
     * 这是 getLocalToDevice() 的遗留版本，去掉了 Z 信息
     * @returns 3x3 变换矩阵
     */
    getTotalMatrix(): number[];

    /**
     * 创建匹配的 Surface
     * @param info - 图像信息
     * @returns Surface 对象或 null
     */
    makeSurface(info: ImageInfo): Surface | null;

    /**
     * 读取像素
     * @param srcX - 源 x 坐标
     * @param srcY - 源 y 坐标
     * @param imageInfo - 图像信息
     * @param dest - 目标缓冲区
     * @param bytesPerRow - 每行字节数
     * @returns 像素数据数组
     */
    readPixels(srcX: number, srcY: number, imageInfo: ImageInfo, dest?: MallocObj,
               bytesPerRow?: number): Float32Array | Uint8Array | null;

    /**
     * 恢复到指定的保存计数
     * @param saveCount - 目标保存计数
     */
    restoreToCount(saveCount: number): void;

    /**
     * 旋转坐标系
     * @param rot - 旋转角度（度）
     * @param rx - 旋转中心 x 坐标
     * @param ry - 旋转中心 y 坐标
     */
    rotate(rot: AngleInDegrees, rx: number, ry: number): void;

    /**
     * 保存图层
     * @param paint - 绘画样式
     * @param bounds - 边界矩形
     * @param backdrop - 背景图像过滤器
     * @param flags - 保存标志
     * @param backdropFilterTileMode - 背景过滤器平铺模式
     * @returns 保存计数
     */
    saveLayer(paint?: Paint, bounds?: InputRect | null, backdrop?: ImageFilter | null,
              flags?: SaveLayerFlag, backdropFilterTileMode?: TileMode): number;

    /**
     * 倾斜坐标系
     * @param sx - x 轴倾斜量
     * @param sy - y 轴倾斜量
     */
    skew(sx: number, sy: number): void;

    /**
     * 写入像素
     * @param pixels - 像素数据
     * @param srcWidth - 源宽度
     * @param srcHeight - 源高度
     * @param destX - 目标 x 坐标
     * @param destY - 目标 y 坐标
     * @param alphaType - Alpha 类型
     * @param colorType - 颜色类型
     * @param colorSpace - 色彩空间
     * @returns 是否成功写入
     */
    writePixels(pixels: Uint8Array | number[], srcWidth: number, srcHeight: number,
                destX: number, destY: number, alphaType?: AlphaType, colorType?: ColorType,
                colorSpace?: ColorSpace): boolean;
}

/**
 * 绘画接口
 * 定义绘制的样式和外观
 */
export interface Paint extends EmbindObject<"Paint"> {
    /**
     * 设置颜色
     * @param color - 输入颜色
     * @param colorSpace - 色彩空间，默认为 sRGB
     */
    setColor(color: InputColor, colorSpace?: ColorSpace): void;

    /**
     * 设置绘制样式（填充或描边）
     * @param style - 绘画样式
     */
    setStyle(style: PaintStyle): void;

    /**
     * 设置描边宽度
     * @param width - 描边宽度
     */
    setStrokeWidth(width: number): void;

    /**
     * 获取透明度和未预乘的 RGB
     * @returns 颜色数组
     */
    getColor(): Color;

    /**
     * 获取描边端点样式
     * @returns 描边端点样式
     */
    getStrokeCap(): StrokeCap;

    /**
     * 获取描边连接样式
     * @returns 描边连接样式
     */
    getStrokeJoin(): StrokeJoin;

    /**
     * 获取描边斜接限制
     * @returns 斜接限制值
     */
    getStrokeMiter(): number;

    /**
     * 获取描边宽度
     * @returns 描边宽度
     */
    getStrokeWidth(): number;

    /**
     * 设置透明度，保持 RGBA 不变
     * @param alpha - 透明度值，0 表示完全透明，1.0 表示不透明
     */
    setAlphaf(alpha: number): void;

    /**
     * 设置抗锯齿
     * @param aa - 是否启用抗锯齿
     */
    setAntiAlias(aa: boolean): void;

    /**
     * 设置混合模式
     * @param mode - 混合模式
     */
    setBlendMode(mode: BlendMode): void;

    /**
     * 设置混合器
     * @param blender - 混合器对象
     */
    setBlender(blender: Blender): void;

    /**
     * 设置颜色分量
     * @param r - 红色分量
     * @param g - 绿色分量
     * @param b - 蓝色分量
     * @param a - 透明度分量
     * @param colorSpace - 色彩空间
     */
    setColorComponents(r: number, g: number, b: number, a: number, colorSpace?: ColorSpace): void;

    /**
     * 设置颜色过滤器
     * @param filter - 颜色过滤器
     */
    setColorFilter(filter: ColorFilter | null): void;

    /**
     * 设置整数颜色
     * @param color - 整数颜色值
     * @param colorSpace - 色彩空间
     */
    setColorInt(color: ColorInt, colorSpace?: ColorSpace): void;

    /**
     * 设置抖动
     * @param shouldDither - 是否启用抖动
     */
    setDither(shouldDither: boolean): void;

    /**
     * 设置图像过滤器
     * @param filter - 图像过滤器
     */
    setImageFilter(filter: ImageFilter | null): void;

    /**
     * 设置蒙版过滤器
     * @param filter - 蒙版过滤器
     */
    setMaskFilter(filter: MaskFilter | null): void;

    /**
     * 设置路径效果
     * @param effect - 路径效果
     */
    setPathEffect(effect: PathEffect | null): void;

    /**
     * 设置着色器
     * @param shader - 着色器对象
     */
    setShader(shader: Shader | null): void;

    /**
     * 设置描边端点样式
     * @param cap - 描边端点样式
     */
    setStrokeCap(cap: StrokeCap): void;

    /**
     * 设置描边连接样式
     * @param join - 描边连接样式
     */
    setStrokeJoin(join: StrokeJoin): void;

    /**
     * 设置描边斜接限制
     * @param limit - 斜接限制值
     */
    setStrokeMiter(limit: number): void;
}

/**
 * 路径接口
 * 表示复杂的几何形状
 */
export interface Path extends EmbindObject<"Path"> {
    /**
     * 添加圆形到路径
     * @param x - 圆心 x 坐标
     * @param y - 圆心 y 坐标
     * @param r - 半径
     * @param isCCW - 是否逆时针
     * @returns 返回修改后的路径
     */
    addCircle(x: number, y: number, r: number, isCCW?: boolean): Path;

    /**
     * 添加矩形到路径
     * @param rect - 要添加的矩形
     * @param isCCW - 是否逆时针
     * @returns 返回修改后的路径
     */
    addRect(rect: InputRect, isCCW?: boolean): Path;

    /**
     * 移动到指定点
     * @param x - x 坐标
     * @param y - y 坐标
     * @returns 返回修改后的路径
     */
    moveTo(x: number, y: number): Path;

    /**
     * 绘制线段到指定点
     * @param x - 目标 x 坐标
     * @param y - 目标 y 坐标
     * @returns 返回修改后的路径
     */
    lineTo(x: number, y: number): Path;

    /**
     * 关闭当前轮廓
     * @returns 返回修改后的路径
     */
    close(): Path;

    /**
     * 添加弧到路径
     * @param oval - 包含弧的椭圆边界
     * @param startAngle - 起始角度（度）
     * @param sweepAngle - 扫描角度（度）
     * @returns 返回修改后的路径
     */
    addArc(oval: InputRect, startAngle: AngleInDegrees, sweepAngle: AngleInDegrees): Path;

    /**
     * 添加椭圆到路径
     * @param oval - 椭圆边界
     * @param isCCW - 是否逆时针
     * @param startIndex - 起始点索引
     * @returns 返回修改后的路径
     */
    addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): Path;

    /**
     * 添加另一个路径
     * @param args - 路径和变换参数
     * @returns 返回修改后的路径或 null
     */
    addPath(...args: any[]): Path | null;

    /**
     * 添加多边形
     * @param points - 点数组
     * @param close - 是否闭合
     * @returns 返回修改后的路径
     */
    addPoly(points: InputFlattenedPointArray, close: boolean): Path;

    /**
     * 添加圆角矩形
     * @param rrect - 圆角矩形
     * @param isCCW - 是否逆时针
     * @returns 返回修改后的路径
     */
    addRRect(rrect: InputRRect, isCCW?: boolean): Path;

    /**
     * 添加动词、点和权重
     * @param verbs - 动词列表
     * @param points - 点数组
     * @param weights - 权重数组
     * @returns 返回修改后的路径
     */
    addVerbsPointsWeights(verbs: VerbList, points: InputFlattenedPointArray,
                          weights?: WeightList): Path;

    /**
     * 添加圆弧（Canvas2D 风格）
     * @param x - 圆心 x 坐标
     * @param y - 圆心 y 坐标
     * @param radius - 半径
     * @param startAngle - 起始角度（弧度）
     * @param endAngle - 结束角度（弧度）
     * @param isCCW - 是否逆时针
     * @returns 返回修改后的路径
     */
    arc(x: number, y: number, radius: number, startAngle: AngleInRadians, endAngle: AngleInRadians,
        isCCW?: boolean): Path;

    /**
     * 添加椭圆弧
     * @param oval - 椭圆边界
     * @param startAngle - 起始角度（度）
     * @param endAngle - 结束角度（度）
     * @param forceMoveTo - 是否强制移动到起点
     * @returns 返回修改后的路径
     */
    arcToOval(oval: InputRect, startAngle: AngleInDegrees, endAngle: AngleInDegrees,
              forceMoveTo: boolean): Path;

    /**
     * 添加旋转椭圆弧
     * @param rx - x 轴半径
     * @param ry - y 轴半径
     * @param xAxisRotate - x 轴旋转角度
     * @param useSmallArc - 是否使用小弧
     * @param isCCW - 是否逆时针
     * @param x - 终点 x 坐标
     * @param y - 终点 y 坐标
     * @returns 返回修改后的路径
     */
    arcToRotated(rx: number, ry: number, xAxisRotate: AngleInDegrees, useSmallArc: boolean,
                 isCCW: boolean, x: number, y: number): Path;

    /**
     * 添加切线弧
     * @param x1 - 第一个切点 x 坐标
     * @param y1 - 第一个切点 y 坐标
     * @param x2 - 第二个切点 x 坐标
     * @param y2 - 第二个切点 y 坐标
     * @param radius - 弧半径
     * @returns 返回修改后的路径
     */
    arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number): Path;

    /**
     * 计算紧密边界
     * @param outputArray - 输出数组
     * @returns 紧密边界矩形
     */
    computeTightBounds(outputArray?: Rect): Rect;

    /**
     * 添加圆锥曲线
     * @param x1 - 控制点 x 坐标
     * @param y1 - 控制点 y 坐标
     * @param x2 - 终点 x 坐标
     * @param y2 - 终点 y 坐标
     * @param w - 权重
     * @returns 返回修改后的路径
     */
    conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path;

    /**
     * 复制路径
     * @returns 路径副本
     */
    copy(): Path;

    /**
     * 获取点数量
     * @returns 路径中的点数量
     */
    countPoints(): number;

    /**
     * 添加虚线效果
     * @param on - 线段长度
     * @param off - 间隔长度
     * @param phase - 相位偏移
     * @returns 是否成功
     */
    dash(on: number, off: number, phase: number): boolean;

    /**
     * 比较路径是否相等
     * @param other - 另一个路径
     * @returns 是否相等
     */
    equals(other: Path): boolean;

    /**
     * 获取填充类型
     * @returns 填充类型
     */
    getFillType(): FillType;

    /**
     * 获取指定索引的点
     * @param index - 点索引
     * @param outputArray - 输出数组
     * @returns 点坐标
     */
    getPoint(index: number, outputArray?: Point): Point;

    /**
     * 检查路径是否易失
     * @returns 是否易失
     */
    isVolatile(): boolean;

    /**
     * 转换为绕组填充
     * @returns 新的路径或 null
     */
    makeAsWinding(): Path | null;

    /**
     * 路径操作
     * @param other - 另一个路径
     * @param op - 路径操作类型
     * @returns 是否成功
     */
    op(other: Path, op: PathOp): boolean;

    /**
     * 相对圆弧
     * @param rx - x 轴半径
     * @param ry - y 轴半径
     * @param xAxisRotate - x 轴旋转角度
     * @param useSmallArc - 是否使用小弧
     * @param isCCW - 是否逆时针
     * @param dx - 相对 x 偏移
     * @param dy - 相对 y 偏移
     * @returns 返回修改后的路径
     */
    rArcTo(rx: number, ry: number, xAxisRotate: AngleInDegrees, useSmallArc: boolean,
           isCCW: boolean, dx: number, dy: number): Path;

    /**
     * 相对圆锥曲线
     * @param dx1 - 控制点相对 x 偏移
     * @param dy1 - 控制点相对 y 偏移
     * @param dx2 - 终点相对 x 偏移
     * @param dy2 - 终点相对 y 偏移
     * @param w - 权重
     * @returns 返回修改后的路径
     */
    rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number): Path;

    /**
     * 相对三次贝塞尔曲线
     * @param cpx1 - 第一个控制点相对 x 偏移
     * @param cpy1 - 第一个控制点相对 y 偏移
     * @param cpx2 - 第二个控制点相对 x 偏移
     * @param cpy2 - 第二个控制点相对 y 偏移
     * @param x - 终点相对 x 偏移
     * @param y - 终点相对 y 偏移
     * @returns 返回修改后的路径
     */
    rCubicTo(cpx1: number, cpy1: number, cpx2: number, cpy2: number, x: number, y: number): Path;

    /**
     * 重置路径（释放内存）
     */
    reset(): void;

    /**
     * 重置路径（保留内存）
     */
    rewind(): void;

    /**
     * 相对线段
     * @param x - 相对 x 偏移
     * @param y - 相对 y 偏移
     * @returns 返回修改后的路径
     */
    rLineTo(x: number, y: number): Path;

    /**
     * 相对移动
     * @param x - 相对 x 偏移
     * @param y - 相对 y 偏移
     * @returns 返回修改后的路径
     */
    rMoveTo(x: number, y: number): Path;

    /**
     * 相对二次贝塞尔曲线
     * @param x1 - 控制点相对 x 偏移
     * @param y1 - 控制点相对 y 偏移
     * @param x2 - 终点相对 x 偏移
     * @param y2 - 终点相对 y 偏移
     * @returns 返回修改后的路径
     */
    rQuadTo(x1: number, y1: number, x2: number, y2: number): Path;

    /**
     * 设置填充类型
     * @param fill - 填充类型
     */
    setFillType(fill: FillType): void;

    /**
     * 设置是否易失
     * @param volatile - 是否易失
     */
    setIsVolatile(volatile: boolean): void;

    /**
     * 简化路径
     * @returns 是否成功
     */
    simplify(): boolean;

    /**
     * 描边路径
     * @param opts - 描边选项
     * @returns 描边后的路径或 null
     */
    stroke(opts?: StrokeOpts): Path | null;

    /**
     * 转换为命令数组
     * @returns 命令数组
     */
    toCmds(): Float32Array;

    /**
     * 变换路径
     * @param args - 变换参数
     * @returns 返回修改后的路径
     */
    transform(...args: any[]): Path;

    /**
     * 修剪路径
     * @param startT - 起始参数（0-1）
     * @param stopT - 结束参数（0-1）
     * @param isComplement - 是否取补集
     * @returns 修剪后的路径或 null
     */
    trim(startT: number, stopT: number, isComplement: boolean): Path | null;
}

/**
 * 字体接口
 */
export interface Font extends EmbindObject<"Font"> {
    /**
     * 设置字体大小
     * @param points - 字体大小（点）
     */
    setSize(points: number): void;

    /**
     * 设置字体
     * @param face - 字体，null 表示使用默认字体
     */
    setTypeface(face: Typeface | null): void;

    /**
     * 获取字体度量信息
     * @returns 字体度量信息
     */
    getMetrics(): FontMetrics;

    /**
     * 获取字形边界
     * @param glyphs - 字形 ID 数组
     * @param paint - 可选的绘画样式
     * @param output - 输出数组
     * @returns 字形边界数组
     */
    getGlyphBounds(glyphs: InputGlyphIDArray, paint?: Paint | null,
                   output?: Float32Array): Float32Array;

    /**
     * 获取字形宽度
     * @param glyphs - 字形 ID 数组
     * @param paint - 可选的绘画样式
     * @param output - 输出数组
     * @returns 字形宽度数组
     */
    getGlyphWidths(glyphs: InputGlyphIDArray, paint?: Paint | null,
                   output?: Float32Array): Float32Array;

    /**
     * 获取字形交叉点
     * @param glyphs - 字形 ID 数组
     * @param positions - 字形位置数组
     * @param top - 顶部位置
     * @param bottom - 底部位置
     * @returns 交叉点数组
     */
    getGlyphIntercepts(glyphs: InputGlyphIDArray, positions: Float32Array | number[],
                       top: number, bottom: number): Float32Array;

    /**
     * 获取 x 轴缩放
     * @returns x 轴缩放值
     */
    getScaleX(): number;

    /**
     * 获取字体大小
     * @returns 字体大小（点）
     */
    getSize(): number;

    /**
     * 获取 x 轴倾斜
     * @returns x 轴倾斜值
     */
    getSkewX(): number;

    /**
     * 是否启用加粗效果
     * @returns 是否加粗
     */
    isEmbolden(): boolean;

    /**
     * 获取字体
     * @returns 字体对象或 null
     */
    getTypeface(): Typeface | null;

    /**
     * 设置边缘处理
     * @param edging - 边缘处理类型
     */
    setEdging(edging: FontEdging): void;

    /**
     * 设置是否使用嵌入位图
     * @param embeddedBitmaps - 是否使用嵌入位图
     */
    setEmbeddedBitmaps(embeddedBitmaps: boolean): void;

    /**
     * 设置字形提示
     * @param hinting - 提示类型
     */
    setHinting(hinting: FontHinting): void;

    /**
     * 设置线性度量
     * @param linearMetrics - 是否使用线性度量
     */
    setLinearMetrics(linearMetrics: boolean): void;

    /**
     * 设置 x 轴缩放
     * @param sx - x 轴缩放值
     */
    setScaleX(sx: number): void;

    /**
     * 设置 x 轴倾斜
     * @param sx - x 轴倾斜值
     */
    setSkewX(sx: number): void;

    /**
     * 设置加粗效果
     * @param embolden - 是否加粗
     */
    setEmbolden(embolden: boolean): void;

    /**
     * 设置子像素定位
     * @param subpixel - 是否启用子像素定位
     */
    setSubpixel(subpixel: boolean): void;
}

/**
 * 图像接口
 */
export interface Image extends EmbindObject<"Image"> {
    /**
     * 获取图像高度
     * @returns 图像高度（像素）
     */
    height(): number;

    /**
     * 获取图像宽度
     * @returns 图像宽度（像素）
     */
    width(): number;

    /**
     * 编码图像为字节数组
     * @param fmt - 图像格式，默认为 PNG
     * @param quality - 质量值（0-100），100 为最佳质量
     * @returns 编码后的字节数组或 null
     */
    encodeToBytes(fmt?: EncodedImageFormat, quality?: number): Uint8Array | null;

    /**
     * 获取颜色空间
     * @returns 颜色空间对象
     */
    getColorSpace(): ColorSpace;

    /**
     * 获取图像信息
     * @returns 部分图像信息
     */
    getImageInfo(): PartialImageInfo;

    /**
     * 创建立方着色器
     * @param tx - x 方向平铺模式
     * @param ty - y 方向平铺模式
     * @param B - 立方重采样参数 B
     * @param C - 立方重采样参数 C
     * @param localMatrix - 本地变换矩阵
     * @returns 着色器对象
     */
    makeShaderCubic(tx: TileMode, ty: TileMode, B: number, C: number,
                    localMatrix?: InputMatrix): Shader;

    /**
     * 创建选项着色器
     * @param tx - x 方向平铺模式
     * @param ty - y 方向平铺模式
     * @param fm - 过滤模式
     * @param mm - mipmap 模式
     * @param localMatrix - 本地变换矩阵
     * @returns 着色器对象
     */
    makeShaderOptions(tx: TileMode, ty: TileMode, fm: FilterMode, mm: MipmapMode,
                    localMatrix?: InputMatrix): Shader;

    /**
     * 读取像素
     * @param srcX - 源 x 坐标
     * @param srcY - 源 y 坐标
     * @param imageInfo - 图像信息
     * @param dest - 目标缓冲区
     * @param bytesPerRow - 每行字节数
     * @returns 像素数据数组或 null
     */
    readPixels(srcX: number, srcY: number, imageInfo: ImageInfo, dest?: MallocObj,
               bytesPerRow?: number): Float32Array | Uint8Array | null;
}

/**
 * Surface 接口
 * 表示可绘制的表面
 */
export interface Surface extends EmbindObject<"Surface"> {
    /**
     * 返回由此 surface 支持的画布
     * @returns Canvas 对象
     */
    getCanvas(): Canvas;

    /**
     * 确保任何排队的绘制都发送到屏幕或 GPU
     */
    flush(): void;

    /**
     * 返回此 surface 的高度（像素）
     * @returns surface 高度
     */
    height(): number;

    /**
     * 返回此 surface 的宽度（像素）
     * @returns surface 宽度
     */
    width(): number;

    /**
     * 便捷的单次绘制方法
     * @param drawFrame - 绘制帧的回调函数
     */
    drawOnce(drawFrame: (_: Canvas) => void): void;

    /**
     * 获取图像信息
     * @returns 图像信息对象
     */
    imageInfo(): ImageInfo;

    /**
     * 从纹理创建图像
     * @param tex - WebGL 纹理
     * @param info - 图像信息
     * @returns 图像对象或 null
     */
    makeImageFromTexture(tex: WebGLTexture, info: ImageInfo): Image | null;

    /**
     * 从纹理源创建图像
     * @param src - 纹理源
     * @param info - 图像信息
     * @param srcIsPremul - 源是否预乘
     * @returns 图像对象或 null
     */
    makeImageFromTextureSource(src: TextureSource, info?: ImageInfo | PartialImageInfo,
                               srcIsPremul?: boolean): Image | null;

    /**
     * 创建兼容的 Surface
     * @param info - 图像信息
     * @returns 新的 Surface 对象
     */
    makeSurface(info: ImageInfo): Surface;

    /**
     * 报告后端类型是否为 GPU
     * @returns 是否为 GPU 后端
     */
    reportBackendTypeIsGPU(): boolean;

    /**
     * 获取采样计数
     * @returns 采样计数
     */
    sampleCnt(): number;

    /**
     * 从源更新纹理
     * @param img - 纹理支持的图像
     * @param src - 纹理源
     * @param srcIsPremul - 源是否预乘
     */
    updateTextureFromSource(img: Image, src: TextureSource, srcIsPremul?: boolean): void;
}

// ================== 基础类型定义 ==================

export type Color = Float32Array;
export type ColorInt = number;
export type Point = Float32Array;
export type Rect = Float32Array;
export type IRect = Int32Array;
export type InputColor = Color | Float32Array | number[];
export type InputRect = Rect | Float32Array | number[];
export type InputPoint = Point | Float32Array | number[];

// 添加缺少的类型定义
export type Matrix3x3 = Float32Array;
export type Matrix4x4 = Float32Array;
export type Vector3 = Float32Array;
export type PosTan = Float32Array;
export type RRect = Float32Array;
export type GlyphIDArray = Uint16Array;
export type InputMatrix = number[] | Float32Array;
export type InputVector3 = number[] | Float32Array;
export type InputFlattenedPointArray = number[] | Float32Array;
export type InputRRect = number[] | Float32Array;
export type InputIRect = number[] | Int32Array;
export type InputGlyphIDArray = number[] | Uint16Array;
export type VerbList = number[] | Uint8Array;
export type WeightList = number[] | Float32Array;
export type ColorIntArray = number[] | Uint32Array;
export type AngleInDegrees = number;
export type AngleInRadians = number;

// 枚举类型
export type ClipOp = EmbindEnumEntity;
export type FillType = EmbindEnumEntity;
export type PathOp = EmbindEnumEntity;
export type StrokeCap = EmbindEnumEntity;
export type StrokeJoin = EmbindEnumEntity;
export type FontEdging = EmbindEnumEntity;
export type FontHinting = EmbindEnumEntity;
export type FilterMode = EmbindEnumEntity;
export type MipmapMode = EmbindEnumEntity;
export type EncodedImageFormat = EmbindEnumEntity;
export type VertexMode = EmbindEnumEntity;
export type SaveLayerFlag = EmbindEnumEntity;
export type PointMode = EmbindEnumEntity;

// 复杂对象类型
export type SkPicture = EmbindObject<"SkPicture">;

// 文本相关枚举类型
export type TextAlign = EmbindEnumEntity;
export type TextDirection = EmbindEnumEntity;
export type TextBaseline = EmbindEnumEntity;
export type TextHeightBehavior = EmbindEnumEntity;
export type DecorationStyle = EmbindEnumEntity;
export type PlaceholderAlignment = EmbindEnumEntity;
export type RectHeightStyle = EmbindEnumEntity;
export type RectWidthStyle = EmbindEnumEntity;
export type Affinity = EmbindEnumEntity;

// 其他缺失类型
export type ShapedLine = any; // 复杂类型，简化处理
export type InputVector2 = number[] | Float32Array;
export type Vector2 = Float32Array;
export type ColorProperty = any; // 颜色属性接口
export type OpacityProperty = any; // 透明度属性接口
export type TextProperty = any; // 文本属性接口
export type TransformProperty = any; // 变换属性接口
export type SlotInfo = any; // 插槽信息接口
export type SlottableTextProperty = any; // 可插槽文本属性接口
export type InputState = EmbindEnumEntity; // 输入状态枚举
export type ModifierKey = EmbindEnumEntity; // 修饰键枚举

// 复杂接口类型
export interface FontStyle {
    weight?: FontWeight;
    width?: FontWidth;
    slant?: FontSlant;
}

export interface FontMetrics {
    ascent: number;
    descent: number;
    leading: number;
    bounds?: Rect;
}

export interface ImageInfo {
    width: number;
    height: number;
    colorType: ColorType;
    alphaType: AlphaType;
}

export interface PartialImageInfo {
    width: number;
    height: number;
    colorType?: ColorType;
    alphaType?: AlphaType;
}

export interface StrokeOpts {
    width?: number;
    miter_limit?: number;
    precision?: number;
    join?: StrokeJoin;
    cap?: StrokeCap;
}

// 枚举值类型
export type FontWeight = EmbindEnumEntity;
export type FontWidth = EmbindEnumEntity;
export type FontSlant = EmbindEnumEntity;

// 其他必需类型
export interface MallocObj {
    toTypedArray(): ArrayBufferView;
}

export type TextureSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | OffscreenCanvas;
export type WebGLOptions = any;
export type WebGLContextHandle = any;
export type WebGPUCanvasOptions = any;
export type GPUDevice = any;
export type GPUTexture = any;

// ================== 枚举类型（简化） ==================

export type AlphaType = EmbindEnumEntity;
export type BlendMode = EmbindEnumEntity;
export type ColorSpace = EmbindEnumEntity;
export type ColorType = EmbindEnumEntity;
export type PaintStyle = EmbindEnumEntity;
export type TileMode = EmbindEnumEntity;

// ================== 复杂类型 ==================

export type Shader = EmbindObject<"Shader">;
export type ColorFilter = EmbindObject<"ColorFilter">;
export type ImageFilter = EmbindObject<"ImageFilter">;
export type PathEffect = EmbindObject<"PathEffect">;
export type MaskFilter = EmbindObject<"MaskFilter">;
export type Blender = EmbindObject<"Blender">;
/**
 * 文本块类型
 * 用于高效渲染文本的预处理对象
 * 更多信息请参见 SkTextBlob.h
 */
export type TextBlob = EmbindObject<"TextBlob">;

/**
 * 字体管理器接口
 * 用于管理和查找字体
 * 更多信息请参见 SkFontMgr.h
 */
export interface FontMgr extends EmbindObject<"FontMgr"> {
    /**
     * 返回此管理器中加载的字体家族数量
     * 用于调试很有用
     * @returns 字体家族数量
     */
    countFamilies(): number;

    /**
     * 返回第 n 个字体家族名称
     * 用于调试很有用
     * @param index - 字体家族索引
     * @returns 字体家族名称
     */
    getFamilyName(index: number): string;

    /**
     * 查找与指定家族名称和样式最匹配的字体
     * @param name - 字体家族名称
     * @param style - 字体样式
     * @returns 匹配的字体
     */
    matchFamilyStyle(name: string, style: FontStyle): Typeface;
}

/**
 * 字体类型接口
 * 表示字体文件或字体数据
 * 更多信息请参见 SkTypeface.h
 */
export interface Typeface extends EmbindObject<"Typeface"> {
    /**
     * 检索提供字符串中每个代码点的字形 ID
     * 注意字形 ID 依赖于字体，不同字体对相同代码点可能有不同的 ID
     * @param str - 输入字符串
     * @param numCodePoints - 字符串中的代码点数量，默认为 str.length
     * @param output - 如果提供，结果将复制到此数组
     * @returns 字形 ID 数组
     */
    getGlyphIDs(str: string, numCodePoints?: number,
                output?: GlyphIDArray): GlyphIDArray;

    /**
     * 返回字体家族名称
     * @returns 字体家族名称
     */
    getFamilyName(): string;
}

/**
 * 顶点接口
 * 表示三角网格数据
 * 更多信息请参见 SkVertices.h
 */
export interface Vertices extends EmbindObject<"Vertices"> {
    /**
     * 返回顶点的边界区域
     * @param outputArray - 如果提供，边界框将复制到此数组
     * @returns 边界矩形
     */
    bounds(outputArray?: Rect): Rect;

    /**
     * 返回此顶点对象的唯一 ID
     * @returns 唯一标识符
     */
    uniqueID(): number;
}

/**
 * 轮廓测量迭代器接口
 * 用于迭代路径中的轮廓
 */
export interface ContourMeasureIter extends EmbindObject<"ContourMeasureIter"> {
    /**
     * 迭代路径中的轮廓，为路径中的每个轮廓返回一个轮廓测量对象
     * 完成时返回 null
     * @returns 轮廓测量对象或 null
     */
    next(): ContourMeasure | null;
}

/**
 * 轮廓测量接口
 * 提供轮廓的测量和分析功能
 */
export interface ContourMeasure extends EmbindObject<"ContourMeasure"> {
    /**
     * 返回给定距离在轮廓上的位置和切线
     * 返回值是 4 个浮点数，顺序为：posX, posY, vecX, vecY
     * @param distance - 距离，将被固定在 0 和 length() 之间
     * @param output - 如果提供，PosTan 的四个浮点数将复制到此数组
     * @returns PosTan 数组
     */
    getPosTan(distance: number, output?: PosTan): PosTan;

    /**
     * 返回表示此轮廓片段的路径
     * @param startD - 起始距离，将被固定在 0 和 length() 之间
     * @param stopD - 结束距离，将被固定在 0 和 length() 之间
     * @param startWithMoveTo - 是否以 moveTo 开始
     * @returns 路径片段
     */
    getSegment(startD: number, stopD: number, startWithMoveTo: boolean): Path;

    /**
     * 返回轮廓是否闭合
     * @returns 是否闭合
     */
    isClosed(): boolean;

    /**
     * 返回此轮廓的长度
     * @returns 轮廓长度
     */
    length(): number;
}

/**
 * 动画图像接口
 * 用于处理动画 GIF 等格式
 * 更多信息请参见 SkAnimatedImage.h
 */
export interface AnimatedImage extends EmbindObject<"AnimatedImage"> {
    /**
     * 返回当前帧的持续时间（毫秒）
     * @returns 当前帧持续时间
     */
    currentFrameDuration(): number;

    /**
     * 解码下一帧，返回新帧的持续时间（毫秒）
     * 当动画在最后一帧时返回 -1
     * @returns 下一帧持续时间或 -1
     */
    decodeNextFrame(): number;

    /**
     * 返回动画中的总帧数
     * @returns 总帧数
     */
    getFrameCount(): number;

    /**
     * 返回此动画的重复计数
     * @returns 重复次数
     */
    getRepetitionCount(): number;

    /**
     * 返回当前帧的静态图像
     * 如果没有当前帧则返回 null
     * @returns 当前帧图像或 null
     */
    makeImageAtCurrentFrame(): Image | null;

    /**
     * 将动画重置到开始
     */
    reset(): void;
}

/**
 * 段落接口
 * 用于文本段落的布局和渲染
 * 更多信息请参见 SkParagraph.h
 */
export interface Paragraph extends EmbindObject<"Paragraph"> {
    /**
     * 检查是否超过最大行数
     * @returns 是否超过最大行数
     */
    didExceedMaxLines(): boolean;

    /**
     * 获取字母基线
     * @returns 字母基线位置
     */
    getAlphabeticBaseline(): number;

    /**
     * 返回与提供的坐标对应的字形索引
     * 以左上角为原点，+y 方向向下
     * @param dx - x 坐标
     * @param dy - y 坐标
     * @returns 位置和仿射信息
     */
    getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity;

    /**
     * 返回指定段落坐标处最接近的字形信息
     * @param dx - x 坐标
     * @param dy - y 坐标
     * @returns 字形信息或 null
     */
    getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null;

    /**
     * 返回指定 UTF-16 偏移处的字形信息
     * @param index - UTF-16 索引
     * @returns 字形信息或 null
     */
    getGlyphInfoAt(index: number): GlyphInfo | null;

    /**
     * 获取段落高度
     * @returns 段落高度
     */
    getHeight(): number;

    /**
     * 获取意识形态基线
     * @returns 意识形态基线位置
     */
    getIdeographicBaseline(): number;

    /**
     * 返回包含指定 UTF-16 偏移的行号
     * @param index - UTF-16 索引
     * @returns 行号，如果越界则返回 -1
     */
    getLineNumberAt(index: number): number;

    /**
     * 获取所有行的度量信息
     * @returns 行度量信息数组
     */
    getLineMetrics(): LineMetrics[];

    /**
     * 获取指定行号的行度量信息
     * @param lineNumber - 行号
     * @returns 行度量信息或 null
     */
    getLineMetricsAt(lineNumber: number): LineMetrics | null;

    /**
     * 获取最长行的宽度
     * @returns 最长行宽度
     */
    getLongestLine(): number;

    /**
     * 获取最大内在宽度
     * @returns 最大内在宽度
     */
    getMaxIntrinsicWidth(): number;

    /**
     * 获取最大宽度
     * @returns 最大宽度
     */
    getMaxWidth(): number;

    /**
     * 获取最小内在宽度
     * @returns 最小内在宽度
     */
    getMinIntrinsicWidth(): number;

    /**
     * 返回段落中可见行的总数
     * @returns 可见行数
     */
    getNumberOfLines(): number;

    /**
     * 获取占位符的矩形
     * @returns 带方向的矩形数组
     */
    getRectsForPlaceholders(): RectWithDirection[];

    /**
     * 返回包围指定字形索引范围内所有文本的边界框
     * @param start - 起始索引
     * @param end - 结束索引
     * @param hStyle - 高度样式
     * @param wStyle - 宽度样式
     * @returns 带方向的矩形数组
     */
    getRectsForRange(start: number, end: number, hStyle: RectHeightStyle,
                     wStyle: RectWidthStyle): RectWithDirection[];

    /**
     * 查找包含指定偏移处字形的单词边界
     * @param offset - 偏移量
     * @returns 单词边界范围
     */
    getWordBoundary(offset: number): URange;

    /**
     * 返回描述段落的形状线对象数组
     * @returns 形状线数组
     */
    getShapedLines(): ShapedLine[];

    /**
     * 布局文本，使其包装到给定宽度
     * @param width - 布局宽度
     */
    layout(width: number): void;

    /**
     * 在形状化后调用，返回未被任何提供字体匹配的字形 ID
     * @returns 未解析的代码点数组
     */
    unresolvedCodepoints(): number[];
}

/**
 * 段落构建器接口
 * 用于构建段落对象
 */
export interface ParagraphBuilder extends EmbindObject<"ParagraphBuilder"> {
    /**
     * 添加占位符
     * @param width - 宽度
     * @param height - 高度
     * @param alignment - 对齐方式
     * @param baseline - 基线
     * @param offset - 偏移量
     */
    addPlaceholder(width?: number, height?: number, alignment?: PlaceholderAlignment,
                   baseline?: TextBaseline, offset?: number): void;

    /**
     * 向构建器添加文本
     * @param str - 文本字符串
     */
    addText(str: string): void;

    /**
     * 构建段落对象
     * @returns 段落对象
     */
    build(): Paragraph;

    /**
     * 弹出样式
     */
    pop(): void;

    /**
     * 推送样式
     * @param textStyle - 文本样式
     */
    pushStyle(textStyle: TextStyle): void;

    /**
     * 推送绘画样式
     * @param paint - 绘画样式
     */
    pushPaintStyle(paint: Paint): void;

    /**
     * 重置构建器
     */
    reset(): void;
}

/**
 * 段落样式接口
 * 定义段落的外观和布局属性
 */
export interface ParagraphStyle {
    /** 是否禁用字体提示 */
    disableHinting?: boolean;
    /** 省略号字符串 */
    ellipsis?: string;
    /** 行高倍数 */
    heightMultiplier?: number;
    /** 最大行数 */
    maxLines?: number;
    /** 是否替换制表符字符 */
    replaceTabCharacters?: boolean;
    /** 支柱样式 */
    strutStyle?: StrutStyle;
    /** 文本对齐方式 */
    textAlign?: TextAlign;
    /** 文本方向 */
    textDirection?: TextDirection;
    /** 文本高度行为 */
    textHeightBehavior?: TextHeightBehavior;
    /** 文本样式 */
    textStyle?: TextStyle;
    /** 是否应用舍入修正 */
    applyRoundingHack?: boolean;
}

/**
 * 带仿射的位置接口
 * 表示文本中的位置和方向信息
 */
export interface PositionWithAffinity {
    /** 位置 */
    pos: number;
    /** 仿射方向 */
    affinity: Affinity;
}

/**
 * SkSL 统一变量接口
 * 用于着色器的统一变量定义
 */
export interface SkSLUniform {
    /** 列数 */
    columns: number;
    /** 行数 */
    rows: number;
    /** 统一变量数组中此统一变量的起始索引 */
    slot: number;
    /** 是否为整数类型 */
    isInteger: boolean;
}

/**
 * 文本字体特性接口
 * 定义字体的 OpenType 特性
 */
export interface TextFontFeatures {
    /** 特性名称 */
    name: string;
    /** 特性值 */
    value: number;
}

/**
 * 文本字体变化接口
 * 定义字体的可变轴设置
 */
export interface TextFontVariations {
    /** 变化轴名称 */
    axis: string;
    /** 变化值 */
    value: number;
}

/**
 * 文本阴影接口
 * 定义文本阴影的外观
 */
export interface TextShadow {
    /** 阴影颜色 */
    color?: InputColor;
    /** x 和 y 偏移的二维数组，默认为 [0, 0] */
    offset?: number[];
    /** 模糊半径 */
    blurRadius?: number;
}

/**
 * 文本样式接口
 * 定义文本的完整样式属性
 */
export interface TextStyle {
    /** 背景颜色 */
    backgroundColor?: InputColor;
    /** 文本颜色 */
    color?: InputColor;
    /** 装饰（下划线、删除线等） */
    decoration?: number;
    /** 装饰颜色 */
    decorationColor?: InputColor;
    /** 装饰厚度 */
    decorationThickness?: number;
    /** 装饰样式 */
    decorationStyle?: DecorationStyle;
    /** 字体家族列表 */
    fontFamilies?: string[];
    /** 字体特性 */
    fontFeatures?: TextFontFeatures[];
    /** 字体大小 */
    fontSize?: number;
    /** 字体样式 */
    fontStyle?: FontStyle;
    /** 字体变化 */
    fontVariations?: TextFontVariations[];
    /** 前景色 */
    foregroundColor?: InputColor;
    /** 行高倍数 */
    heightMultiplier?: number;
    /** 是否使用半行距 */
    halfLeading?: boolean;
    /** 字母间距 */
    letterSpacing?: number;
    /** 语言区域 */
    locale?: string;
    /** 阴影数组 */
    shadows?: TextShadow[];
    /** 文本基线 */
    textBaseline?: TextBaseline;
    /** 单词间距 */
    wordSpacing?: number;
}

/**
 * 色调颜色输入接口
 * 用于计算材质设计阴影颜色
 */
export interface TonalColorsInput {
    /** 环境光颜色 */
    ambient: InputColor;
    /** 聚光灯颜色 */
    spot: InputColor;
}

/**
 * 色调颜色输出接口
 * 计算后的材质设计阴影颜色
 */
export interface TonalColorsOutput {
    /** 环境光颜色 */
    ambient: Color;
    /** 聚光灯颜色 */
    spot: Color;
}

/**
 * 字体提供者接口
 * 扩展 FontMgr 以提供字体注册功能
 */
export interface TypefaceFontProvider extends FontMgr {
    /**
     * 注册给定的字体，使用给定的家族名称
     * （忽略字体本身的名称）
     * @param bytes - 字体的原始字节数据
     * @param family - 字体家族名称
     */
    registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void;
}

/**
 * 字体集合接口
 * 用于管理字体集合
 * 更多信息请参见 FontCollection.h
 */
export interface FontCollection extends EmbindObject<"FontCollection"> {
    /**
     * 启用动态发现字体的回退功能
     * 用于处理文本样式字体无法处理的字符
     */
    enableFontFallback(): void;

    /**
     * 设置用于定位字体的默认提供者
     * @param fontManager - 字体管理器
     */
    setDefaultFontManager(fontManager: TypefaceFontProvider | null): void;
}

/**
 * Unicode 范围接口
 * 定义文本范围的起始和结束位置
 */
export interface URange {
    /** 起始位置 */
    start: number;
    /** 结束位置 */
    end: number;
}

/**
 * 字形信息接口
 * 提供字形的详细布局和属性信息
 */
export interface GlyphInfo {
    /** 
     * 代码点所属字符簇的布局边界（在段落坐标系中）
     * 矩形的宽度是字符簇的水平前进距离
     * 矩形的高度是字符簇占据整行时的行高
     */
    graphemeLayoutBounds: Rect;
    /** 代码点所属字符簇的左闭右开 UTF-16 范围 */
    graphemeClusterTextRange: URange;
    /** 字符簇的书写方向 */
    dir: TextDirection;
    /** 
     * 关联的字形是否指向文本布局库添加的省略号
     * 当文本被截断时可能会添加省略号
     */
    isEllipsis: boolean;
}

/**
 * 行度量接口
 * 提供文本行的详细度量信息
 * 更多信息请参见 Metrics.h
 */
export interface LineMetrics {
    /** 行在文本缓冲区中的起始索引 */
    startIndex: number;
    /** 行在文本缓冲区中的结束索引 */
    endIndex: number;
    /** 不包括空白字符的结束索引 */
    endExcludingWhitespaces: number;
    /** 包括换行符的结束索引 */
    endIncludingNewline: number;
    /** 行是否以硬断行结束（如换行符） */
    isHardBreak: boolean;
    /** 行的最终计算上升高度 */
    ascent: number;
    /** 行的最终计算下降高度 */
    descent: number;
    /** round(ascent + descent) */
    height: number;
    /** 行的宽度 */
    width: number;
    /** 行的左边缘，右边缘可通过 left + width 获得 */
    left: number;
    /** 此行基线从段落顶部的 y 位置 */
    baseline: number;
    /** 从零开始的行号 */
    lineNumber: number;
}

/**
 * 范围接口
 * 定义一个数值范围
 */
export interface Range {
    /** 起始值 */
    first: number;
    /** 结束值 */
    last: number;
}

/**
 * 字形运行接口
 * 形状化文本运行的信息
 * 更多信息请参见 Paragraph.getShapedLines()
 */
export interface GlyphRun {
    /** 字形 ID 数组 */
    glyphs: GlyphIDArray;
    /** 位置数组，每个字形有 x,y 坐标对 */
    positions: Float32Array;
    /** 偏移数组 */
    offsets: Float32Array;
    /** 字体对象 */
    font: Font;
    /** 运行的标志 */
    flags: number;
}

/**
 * 字体块接口
 * 定义文本中的字体块
 */
export interface FontBlock {
    /** 字体对象 */
    font: Font;
    /** 块的范围 */
    range: Range;
}

/**
 * 带方向的矩形接口
 * 扩展矩形以包含文本方向信息
 */
export interface RectWithDirection {
    /** 矩形 */
    rect: Rect;
    /** 文本方向 */
    direction: TextDirection;
}

/**
 * SkPicture 接口
 * 图片对象，可以记录和重放绘制命令
 * 更多信息请参见 SkPicture.h
 */
export interface SkPicture extends EmbindObject<"SkPicture"> {
    /**
     * 返回一个使用此图片绘制的新着色器
     * @param tmx - x 方向的平铺模式
     * @param tmy - y 方向的平铺模式
     * @param mode - 瓦片过滤方式
     * @param localMatrix - 采样时使用的可选矩阵
     * @param tileRect - 图片坐标中的瓦片矩形
     * @returns 着色器对象
     */
    makeShader(tmx: TileMode, tmy: TileMode, mode: FilterMode,
               localMatrix?: InputMatrix, tileRect?: InputRect): Shader;

    /**
     * 返回图片的边界区域
     * @param outputArray - 如果提供，边界框将复制到此数组
     * @returns 边界矩形
     */
    cullRect(outputArray?: Rect): Rect;

    /**
     * 返回近似的字节大小（不包括大对象）
     * @returns 字节大小
     */
    approximateBytesUsed(): number;

    /**
     * 返回此 SkPicture 的序列化格式
     * 格式可能随时更改，不保证向后或向前兼容
     * @returns 序列化的字节数组或 null
     */
    serialize(): Uint8Array | null;
}

/**
 * 图片录制器接口
 * 用于录制绘制命令并生成 SkPicture
 */
export interface PictureRecorder extends EmbindObject<"PictureRecorder"> {
    /**
     * 返回一个用于绘制的画布
     * 绘制完成后调用 finishRecordingAsPicture()
     * @param bounds - 用于裁剪结果的矩形
     * @param computeBounds - 是否计算更精确的边界
     * @returns 绘制画布
     */
    beginRecording(bounds: InputRect, computeBounds?: boolean): Canvas;

    /**
     * 将捕获的绘制命令作为图片返回，并使之前返回的画布失效
     * @returns SkPicture 对象
     */
    finishRecordingAsPicture(): SkPicture;
}

/**
 * 运行时效果接口
 * 用于创建自定义着色器和混合器
 * 更多信息请参见 SkRuntimeEffect.h
 */
export interface RuntimeEffect extends EmbindObject<"RuntimeEffect"> {
    /**
     * 使用给定的统一数据创建混合器
     * @param uniforms - 统一变量数据
     * @returns 混合器对象
     */
    makeBlender(uniforms: Float32Array | number[] | MallocObj): Blender;

    /**
     * 使用给定的统一数据创建着色器
     * @param uniforms - 统一变量数据
     * @param localMatrix - 可选的本地矩阵
     * @returns 着色器对象
     */
    makeShader(uniforms: Float32Array | number[] | MallocObj,
               localMatrix?: InputMatrix): Shader;

    /**
     * 使用给定的统一数据和子着色器创建着色器
     * @param uniforms - 统一变量数据
     * @param children - 子着色器数组
     * @param localMatrix - 可选的本地矩阵
     * @returns 着色器对象
     */
    makeShaderWithChildren(uniforms: Float32Array | number[] | MallocObj,
                           children?: Shader[], localMatrix?: InputMatrix): Shader;

    /**
     * 返回第 n 个统一变量
     * @param index - 统一变量索引
     * @returns SkSL 统一变量对象
     */
    getUniform(index: number): SkSLUniform;

    /**
     * 返回效果上的统一变量数量
     * @returns 统一变量数量
     */
    getUniformCount(): number;

    /**
     * 返回效果上所有统一变量的浮点数总数
     * @returns 浮点数总数
     */
    getUniformFloatCount(): number;

    /**
     * 返回第 n 个效果统一变量的名称
     * @param index - 统一变量索引
     * @returns 统一变量名称
     */
    getUniformName(index: number): string;
}

/**
 * 图像过滤器接口
 * 用于对图像应用各种效果
 * 更多信息请参见 ImageFilter.h
 */
export interface ImageFilter extends EmbindObject<"ImageFilter"> {
    /**
     * 返回应用此过滤器后 inputRect 的更新边界
     * @param drawBounds - 应用过滤器前几何体的本地边界框
     * @param ctm - 使用过滤器时的当前变换矩阵
     * @param outputRect - 如果提供，结果将输出到此数组
     * @returns 描述更新边界的 IRect
     */
    getOutputBounds(drawBounds: Rect, ctm?: InputMatrix, outputRect?: IRect): IRect;
}

/**
 * Skottie 动画接口
 * 基础的 Lottie 动画播放接口
 * 更多信息请参见 SkottieAnimation.h
 */
export interface SkottieAnimation extends EmbindObject<"SkottieAnimation"> {
    /**
     * 返回动画持续时间（秒）
     * @returns 动画持续时间
     */
    duration(): number;

    /**
     * 返回动画帧率（帧/秒）
     * @returns 动画帧率
     */
    fps(): number;

    /**
     * 绘制当前动画帧
     * 必须先调用 seek 或 seekFrame
     * @param canvas - 绘制画布
     * @param dstRect - 目标矩形
     */
    render(canvas: Canvas, dstRect?: InputRect): void;

    /**
     * 设置动画位置（已弃用，请使用 seekFrame）
     * @param t - 值范围 [0.0, 1.0]，0 是第一帧，1 是最后一帧
     * @param damageRect - 如果提供，将损坏帧复制到此处
     * @returns 受影响的矩形
     */
    seek(t: number, damageRect?: Rect): Rect;

    /**
     * 更新动画状态以匹配指定的帧索引
     * 相对于 duration() * fps()
     * @param frame - 帧索引，允许小数值
     * @param damageRect - 如果提供，将损坏帧复制到此处
     * @returns 受此动画影响的矩形
     */
    seekFrame(frame: number, damageRect?: Rect): Rect;

    /**
     * 返回此动画的大小
     * @param outputSize - 如果提供，大小将复制到此处
     * @returns 动画大小
     */
    size(outputSize?: Point): Point;

    /**
     * 返回动画版本
     * @returns 版本字符串
     */
    version(): string;
}

/**
 * 托管 Skottie 动画接口
 * 扩展 SkottieAnimation 以提供高级控制功能
 */
export interface ManagedSkottieAnimation extends SkottieAnimation {
    /**
     * 设置颜色属性
     * @param key - 属性键
     * @param color - 颜色值
     * @returns 是否成功设置
     */
    setColor(key: string, color: InputColor): boolean;

    /**
     * 设置透明度属性
     * @param key - 属性键
     * @param opacity - 透明度值
     * @returns 是否成功设置
     */
    setOpacity(key: string, opacity: number): boolean;

    /**
     * 设置文本属性
     * @param key - 属性键
     * @param text - 文本内容
     * @param size - 文本大小
     * @returns 是否成功设置
     */
    setText(key: string, text: string, size: number): boolean;

    /**
     * 设置变换属性
     * @param key - 属性键
     * @param anchor - 锚点
     * @param position - 位置
     * @param scale - 缩放
     * @param rotation - 旋转角度
     * @param skew - 倾斜
     * @param skew_axis - 倾斜轴
     * @returns 是否成功设置
     */
    setTransform(key: string, anchor: InputPoint, position: InputPoint, scale: InputVector2,
                 rotation: number, skew: number, skew_axis: number): boolean;

    /**
     * 获取动画标记
     * @returns 动画标记数组
     */
    getMarkers(): AnimationMarker[];

    /**
     * 获取颜色属性
     * @returns 颜色属性数组
     */
    getColorProps(): ColorProperty[];

    /**
     * 获取透明度属性
     * @returns 透明度属性数组
     */
    getOpacityProps(): OpacityProperty[];

    /**
     * 获取文本属性
     * @returns 文本属性数组
     */
    getTextProps(): TextProperty[];

    /**
     * 获取变换属性
     * @returns 变换属性数组
     */
    getTransformProps(): TransformProperty[];

    /**
     * 获取插槽信息
     * @returns 插槽信息
     */
    getSlotInfo(): SlotInfo;

    /**
     * 设置颜色插槽
     * @param key - 插槽键
     * @param color - 颜色值
     * @returns 是否成功设置
     */
    setColorSlot(key: string, color: InputColor): boolean;

    /**
     * 设置标量插槽
     * @param key - 插槽键
     * @param scalar - 标量值
     * @returns 是否成功设置
     */
    setScalarSlot(key: string, scalar: number): boolean;

    /**
     * 设置二维向量插槽
     * @param key - 插槽键
     * @param vec2 - 二维向量
     * @returns 是否成功设置
     */
    setVec2Slot(key: string, vec2: InputVector2): boolean;

    /**
     * 设置文本插槽
     * @param key - 插槽键
     * @param text - 可插槽文本属性
     * @returns 是否成功设置
     */
    setTextSlot(key: string, text: SlottableTextProperty): boolean;

    /**
     * 设置图像插槽
     * @param key - 插槽键
     * @param assetName - 资源名称
     * @returns 是否成功设置
     */
    setImageSlot(key: string, assetName: string): boolean;

    /**
     * 获取颜色插槽值
     * @param key - 插槽键
     * @returns 颜色值或 null
     */
    getColorSlot(key: string): Color | null;

    /**
     * 获取标量插槽值
     * @param key - 插槽键
     * @returns 标量值或 null
     */
    getScalarSlot(key: string): number | null;

    /**
     * 获取二维向量插槽值
     * @param key - 插槽键
     * @returns 二维向量或 null
     */
    getVec2Slot(key: string): Vector2 | null;

    /**
     * 获取文本插槽值
     * @param key - 插槽键
     * @returns 可插槽文本属性或 null
     */
    getTextSlot(key: string): SlottableTextProperty | null;

    /**
     * 将 WYSIWYG 编辑器附加到文本图层
     * @param id - 图层 ID
     * @param index - 图层索引
     * @returns 是否成功附加
     */
    attachEditor(id: string, index: number): boolean;

    /**
     * 启用/禁用当前编辑器
     * @param enable - 是否启用
     */
    enableEditor(enable: boolean): void;

    /**
     * 向活动编辑器发送按键事件
     * @param key - 按键
     * @returns 是否成功处理
     */
    dispatchEditorKey(key: string): boolean;

    /**
     * 向活动编辑器发送指针事件（画布坐标）
     * @param x - x 坐标
     * @param y - y 坐标
     * @param state - 输入状态
     * @param modifier - 修饰键
     * @returns 是否成功处理
     */
    dispatchEditorPointer(x: number, y: number, state: InputState, modifier: ModifierKey): boolean;

    /**
     * 调整相对光标权重（默认：1）
     * @param w - 权重值
     */
    setEditorCursorWeight(w: number): void;
}

/**
 * 动画标记接口
 * 定义动画中的时间标记点
 */
export interface AnimationMarker {
    /** 标记名称 */
    name: string;
    /** 起始时间（0.0 到 1.0） */
    t0: number;
    /** 结束时间（0.0 到 1.0） */
    t1: number;
}

/**
 * 音频播放器接口
 * 在 Skottie 播放期间维护单个音频层
 */
export interface AudioPlayer {
    /**
     * 播放控制回调，为每个对应的 Animation::seek() 发出
     * 将寻找到相对于图层时间轴原点的时间 t（秒）
     * 负 t 值用于信号关闭状态（在图层跨度外停止播放）
     * @param t - 时间（秒）
     */
    seek(t: number): void;
}

/**
 * 声音映射接口
 * 声音名称（字符串）到 AudioPlayer 的映射
 */
export interface SoundMap {
    /**
     * 返回特定音频层的 AudioPlayer
     * @param key - 字符串标识符，所需 AudioPlayer 管理的音频文件名称
     * @returns 音频播放器
     */
    getPlayer(key: string): AudioPlayer;
}

// ================== 结束注释 ==================

/**
 * CanvasKit TypeScript 类型定义文件 - 中文注释版本
 * 
 * 此文件提供了 CanvasKit WebAssembly 的完整 TypeScript 类型定义，
 * 包含详细的中文注释说明。CanvasKit 是 Google Skia 图形库的 WebAssembly 版本，
 * 为 Web 应用提供高性能的 2D 图形渲染能力。
 * 
 * 主要特性：
 * - 完整的 TypeScript 类型支持
 * - 详细的中文方法说明和用法示例
 * - 涵盖绘图、路径、字体、图像、动画等全部功能
 * - 与原始英文注释并存，便于对照学习
 * 
 * 使用方式：
 * ```typescript
 * import CanvasKitInit from 'canvaskit-wasm';
 * 
 * const CanvasKit = await CanvasKitInit();
 * const surface = CanvasKit.MakeCanvasSurface('my-canvas');
 * const canvas = surface.getCanvas();
 * 
 * const paint = new CanvasKit.Paint();
 * paint.setColor(CanvasKit.Color(255, 0, 0, 1.0));
 * 
 * canvas.drawCircle(100, 100, 50, paint);
 * ```
 * 
 * 注意事项：
 * - 此文件基于 CanvasKit WASM 0.40.0 版本
 * - 不同版本的 CanvasKit 可能存在 API 差异
 * - 使用时请确保与项目中的 CanvasKit 版本匹配
 * 
 * @version 0.40.0
 * @author 根据官方类型定义生成中文注释
 * @license 遵循 CanvasKit 原始许可证
 */
