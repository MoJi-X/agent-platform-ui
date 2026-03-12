# 智能体列表页 Spec

## 1. 页面目标

列表页是智能体管理模块主入口，用于：

- 查询和筛选智能体
- 查看状态、分类、标签、健康状态、发布时间
- 进入详情页
- 打开编辑抽屉
- 打开 ACL 授权抽屉

## 2. 推荐文件

- `src/views/admin/agent/index.vue`
- `src/api/admin/agent.ts`
- `src/types/agent.ts`

## 3. 路由建议

- 路径：`/admin/agent/index`
- 菜单名：`智能体管理`
- 权限码：`ai_agent_view`

## 4. 页面结构

## 4.1 页面头部

- 标题：智能体管理
- 副标题：统一管理智能体主体、默认端点、可见范围、发布状态和对象级权限
- 操作按钮：
  - 新增智能体
  - 分类管理
  - 标签管理

说明：

- 原型中的 `导出`、`保存视图` 首期不做
- 分类管理 / 标签管理可直接跳转到分类标签页

## 4.2 统计卡片

原型有 4 个统计卡片：

- 智能体总数
- 已发布
- 草稿 / 待发布
- 异常端点

首期处理建议：

- 若后端没有统计接口，则首期不做统计卡片
- 或仅保留占位并写明 `TODO`

最终以 `08-open-questions.md` 为准。

## 4.3 查询区域

字段：

- `keyword`
  - 名称 / 编码 / AgentId
- `status`
- `frameworkType`
- `categoryId`
- `tagId`
- `onlyMine`
- `onlyAuthorized`

原型中的以下筛选项首期不做：

- 展示异常端点
- 按最近发布排序

原因：

- 接口文档中没有对应查询参数

## 4.4 表格字段

建议列：

- 选择列
- `agentId`
- 智能体信息
  - `agentName`
  - `agentCode`
- 分类 / 标签
  - `categoryName`
  - `tagNames`
- `frameworkType`
- `status`
- `visibilityScope`
- `healthStatus`
- 发布信息
  - `publishedAt`
  - `current release` 摘要
- `updatedAt`
- 操作列

## 5. 接口依赖

- `GET /console/agents` 或 `GET /console/agents/page`
- `DELETE /console/agents/{agentId}`

说明：

- API 包装层需兼容后端到底返回 `/console/agents` 还是 `/console/agents/page`
- 删除前要走确认框

## 6. 操作设计

## 6.1 首期必须支持

- 详情
- 编辑
- 授权
- 删除

## 6.2 首期建议延后

- 行内发布
- 行内重新发布
- 行内巡检
- 批量下线
- 批量健康检查

原因：

- 这些动作需要补额外弹窗或批量接口
- 详情页已经承接发布、下线、健康检查主流程

## 7. 组件行为

- 复用 `useTable`
- 查询时重置到第一页
- 重置时清空所有查询条件
- 点击新增打开 `form.vue`
- 点击编辑打开 `form.vue` 并传入 `agentId`
- 点击详情跳转到 `/admin/agent/detail?agentId=xxx`
- 点击授权打开 `acl-drawer.vue`

## 8. 状态展示

建议建立前端展示映射：

- `DRAFT` -> 草稿
- `PUBLISHED` -> 已发布
- `OFFLINE` -> 已下线
- `DISABLED` -> 已禁用

- `PRIVATE` -> 私有
- `DEPT` -> 部门可见
- `PUBLIC` -> 公开

- `HEALTHY` -> 健康
- `UNHEALTHY` -> 异常
- `UNKNOWN` -> 未知

## 9. 验收标准

- 页面能正确加载分页列表
- 查询条件能影响接口请求
- 表格字段与接口返回映射正确
- 详情、编辑、授权入口都可用
- 删除动作有确认和成功提示
- 不出现硬编码 mock 数据

