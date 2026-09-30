# Weijie AI 资讯采集服务

这是个人网站的 AI 资讯后端，不包含个人网站前端。Token 仅由定时任务读取，不进入网页、仓库或 API 返回值。

## 部署

1. 打开 https://dashboard.render.com/blueprint/new?repo=https://github.com/wj-perry/wj.design ，选择「杰's workspace」。
2. 检查三个资源：资讯 API、周报定时任务、Postgres 数据库。
3. 在 Blueprint 提示的 `X_BEARER_TOKEN` 栏填写 X 应用的 Bearer Token。数据库地址自动关联，无需手填。
4. 检查费用后点击 Apply。Cron 最低 $1/月，另有 X API 调用费用。免费 Postgres 在 30 天后到期，持续运营必须提前升级；免费 API 空闲后休眠，首次请求可能约一分钟。
5. 部署成功后，在 `weijie-ai-news-weekly` 的 Runs 中点击 Trigger Run 生成首期。失败时检查日志；不会覆盖旧数据。
6. 访问 API 服务的 `/health` 和 `/api/news`，确认健康状态和首期内容，再把实际 API URL 接入原网站。

目前仓库配置就绪不代表已经启用或验证自动更新。定时任务目标时间为每周一北京时间 09:00，UTC 表达式 `0 1 * * 1`。首次手动采集通过后检查下一次定时执行记录。

## 内容范围

最近七天的 OpenAI、Anthropic、Google DeepMind、Hugging Face、Vercel、Figma 公开原帖。最多两页、200 条原帖中选取 30 条，按关键词分类，原文展示，不做自动中文翻译。归档保留 52 期，同周重跑替换当周记录。X recent search 只支持近期搜索，因此不能用于恢复很久以前漏发的周报。

来源、分类和数量可在 `settings.json` 中调整。关键词分类不代表人工核实；网站保留原帖链接。

## 本地验证

使用 Node 22：`npm ci`，`npm test`。服务器使用 `DATABASE_URL`，采集额外需要 `X_BEARER_TOKEN`。仅在安全环境设置凭证，禁止提交 `.env`。运行 `npm start` 提供只读接口；运行 `npm run collect` 采集并原子写入数据库。

`GET /api/news` 返回 `{ "issues": [...] }`；CORS 只允许个人网站域名。接口没有公开的采集或写入入口，页面访问不会消耗 X API 额度。
