# Elione Personal Website

静态个人网站。建议通过本地静态服务器预览，例如 `python3 -m http.server 5173`。

- 首页使用 `assets/home-forest-fountain.png` 作为彩铅森林与喷泉融合背景。
- 首页中心手写体文案在 `index.html` 的 `.hero-copy` 中修改。
- 首页展示 30 张漂浮作品，鼠标移动时会整理成五个分类作品堆，点击作品进入对应分类。
- 首页向下滚动进入第二屏时，大型信封会自动展开信纸；鼠标滑入也可触发展开。
- 作品分类与产品研究文章使用 URL hash 独立切换，例如 `#product-dev`、`#content-analysis`、`#textile-design`、`#amateur-oil-painting` 和 `#about`。
- 纺织类设计按项目统一编排，不再以年份作为主分类；每组作品右侧设有项目注释区。
- 业余油画板块以作品名称作为索引，点击名称切换对应作品图片。
- 平面设计环形预览仅展示竖版作品，并使用缩小后的交互尺寸。
- 产品研究文章收录两篇从业思辨文章，目录与全文均按博客阅读形式排版。
- 产品开发项目包含目标用户、成长维度、开发重点等结构化信息与项目介绍。
- 首页中心区域悬停或点击会触发作品轻柔散开。
- 联系方式在首页信封与关于我页面同步展示。
- 漂浮作品图在 `assets/works/`，替换同名文件即可保持交互布局。
- 如需重新生成占位视觉，运行 `node scripts/generate-assets.mjs`。

## Cloudflare Pages 发布

推送到 `main` 后，GitHub Actions 会将网站发布到现有的 `elione-sjw` Pages 项目，并核对线上提交标记及首页状态。也可以从 Actions 页签手动运行 **Deploy website to Cloudflare Pages**。

仓库需配置 Actions Secret `CLOUDFLARE_API_TOKEN`，令牌只需对应 Cloudflare 账号的 **Cloudflare Pages: Edit** 权限。发布包排除未使用的超大原始媒体，网站实际引用的压缩媒体仍会部署。
