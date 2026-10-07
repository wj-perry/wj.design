window.visualSections = [
  {
    id: 'type', index: '01', title: '字体', count: 7,
    description: '精选网页字体、字体搭配与排版优化工具。',
    tools: [
      ['Fontshare', '可免费商用的高质量专业字体库。', 'https://fontshare.com/'],
      ['Klim', '专注当代网页字体设计的字体工作室。', 'https://klim.co.nz/'],
      ['Fontsource', '通过 npm 自托管开源字体。', 'https://fontsource.org/'],
      ['Wakamai Fondue', '检查字体文件与 OpenType 特性的工具。', 'https://wakamaifondue.com/'],
      ['Utopia', '生成 CSS clamp 的流式排版计算器。', 'https://utopia.fyi/'],
      ['Velvetyne', '提供实验性字体的开源字体工作室。', 'https://velvetyne.fr/'],
      ['Departure Mono', '专为终端设计的像素等宽字体。', 'https://departuremono.com/']
    ]
  },
  {
    id: 'color', index: '02', title: '色彩', count: 5,
    description: '配色生成、对比度检查与色彩计算工具。',
    tools: [
      ['OKLCH', '使用感知均匀色彩空间的颜色选择器。', 'https://oklch.com/'],
      ['Color.review', '帮助设计无障碍配色的对比度检查工具。', 'https://color.review/'],
      ['Huetone', '兼顾对比度的无障碍色板生成器。', 'https://huetone.ardov.me/'],
      ['APCA', '更贴近人眼视觉感知的现代对比度算法。', 'https://www.myndex.com/APCA/'],
      ['Ramps', '使用 OKLCH 生成色彩变量的设计工具。', 'https://www.ramps.studio/']
    ]
  },
  {
    id: 'three-d', index: '03', title: '3D', count: 6,
    description: '在线 3D 建模工具与 WebGL 渲染引擎。',
    tools: [
      ['Three.js', '用于渲染 WebGL 场景的 JavaScript 3D 库。', 'https://threejs.org/'],
      ['React Three Fiber', '面向 Three.js 场景的声明式 React 渲染器。', 'https://r3f.docs.pmnd.rs/'],
      ['Drei', '为 React Three Fiber 提供实用辅助组件。', 'https://drei.docs.pmnd.rs/'],
      ['Blender', '开源的 3D 建模与动画制作套件。', 'https://blender.org/'],
      ['gltf.report', '基于网页的 glTF 三维文件优化工具。', 'https://gltf.report/'],
      ['Poly Haven', '提供 CC0 纹理与模型的公共素材库。', 'https://polyhaven.com/']
    ]
  },
  {
    id: 'shaders', index: '04', title: '着色器', count: 7,
    description: '交互式片元着色器、程序化噪声与画布特效。',
    tools: [
      ['Book of Shaders', '帮助掌握片元着色器的交互式指南。', 'https://thebookofshaders.com/'],
      ['compute.toys', '编写 WGSL 计算着色器的在线沙盒。', 'https://compute.toys/'],
      ['Shaderfrog', '用于组合着色器的可视化节点编辑器。', 'https://shaderfrog.com/'],
      ['shadercn', '基于 vgpu 与 TypeGPU 构建的 React 着色器组件。', 'https://shadercn.run/'],
      ['Paper Shaders', '无需依赖、可以直接导入的着色器集合。', 'https://shaders.paper.design/'],
      ['OpenShaders', '面向网页项目的开源着色器合集。', 'https://openshaders.com/'],
      ['Orbkit', '用于球体动画的 WebGL 着色器渲染器。', 'https://orbkit.zzzzshawn.cloud/']
    ]
  },
  {
    id: 'icons', index: '05', title: '图标', count: 30,
    description: '适用于现代界面的清晰图标家族与符号资源。',
    tools: [
      ['Lucide', '由社区维护的 Feather Icons 分支，包含数千个图标。', 'https://lucide.dev/'],
      ['Phosphor', '提供六种统一字重的图标家族。', 'https://phosphoricons.com/'],
      ['Iconify', '可快速调用海量图标的统一框架。', 'https://iconify.design/'],
      ['Rune Icons', '提供五种风格的极简图标集。', 'https://www.runeicons.com/'],
      ['Icon Museum', '记录移动应用图标设计工艺的档案馆。', 'https://icon.museum/'],
      ['Tabler Icons', '包含数千个轮廓图标的开源图库。', 'https://tabler.io/icons'],
      ['Heroicons', '由 Tailwind 团队手工打造的 SVG 图标。', 'https://heroicons.com/'],
      ['Material Symbols', 'Google 推出的可变图标字体，提供三种风格。', 'https://fonts.google.com/icons'],
      ['Bootstrap Icons', '为 Bootstrap 设计的官方图标库。', 'https://icons.getbootstrap.com/'],
      ['Remix Icon', '提供线性与填充样式的中性图标库。', 'https://remixicon.com/'],
      ['Iconoir', '拥有统一描边风格的开源 SVG 图标库。', 'https://iconoir.com/'],
      ['Ionicons', '适用于网页与移动端的高质量图标包。', 'https://ionic.io/ionicons/'],
      ['Simple Icons', '包含三千多个品牌标识的 SVG 图标库。', 'https://simpleicons.org/'],
      ['theSVG', '精选简洁品牌 SVG 的资源合集。', 'https://thesvg.org/'],
      ['Feather', '基于 24 像素网格的极简开源图标集。', 'https://feathericons.com/'],
      ['Carbon Icons', 'IBM 官方企业设计图标库。', 'https://carbondesignsystem.com/'],
      ['Boxicons', '提供三种风格的矢量图标库。', 'https://boxicons.com/'],
      ['MX Icons', '大型可定制 React 图标集合。', 'https://mx-icons.vercel.app/'],
      ['Eva Icons', '包含 400 个线性与填充图标的资源包。', 'https://akveo.github.io/eva-icons/'],
      ['Devicon', '面向开发者与编程工具的图标集。', 'https://devicon.dev/'],
      ['css.gg', '使用纯 CSS 绘制的 700 个轻量图标。', 'https://css.gg/'],
      ['HugeIcons', '覆盖线性与实心风格的综合图标库。', 'https://hugeicons.com/'],
      ['Reicon', '支持摇树优化并提供两种字重的 React 图标库。', 'https://reicon.dev/'],
      ['Iconsax', '提供六种视觉风格的多用途图标集。', 'https://app.iconsax.io/'],
      ['icons0', '覆盖二十多万个图标的搜索引擎。', 'https://icons0.dev/'],
      ['Heroicons Animated', '加入响应式悬停动画的 Heroicons 图标集。', 'https://heroicons-animated.com/'],
      ['Icons.download', '提供十六种美学风格的精选图标库。', 'https://icons.download/'],
      ['Lucide Animated', '加入微动效的 Lucide 图标合集。', 'https://lucide-animated.com/'],
      ['Icon Foundry', '可搜索多个图标家族的综合收藏库。', 'https://iconfoundry.store/'],
      ['Inkword', '把一个词转换成匹配插画的创作工具。', 'https://inkword.app/']
    ]
  }
];
