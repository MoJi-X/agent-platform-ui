# 开发推进计划

本文件用于后续分阶段让 Codex 实施，不建议一次性实现整个模块。

## Task AGENT-01 共享层

目标：

- 建立 `types`
- 建立 `api`
- 建立状态 / 权限 / 枚举映射常量

输出：

- `src/types/agent.ts`
- `src/api/admin/agent.ts`
- `src/api/admin/agent-category.ts`
- `src/api/admin/agent-tag.ts`

验证：

- `npm run lint:eslint`

## Task AGENT-02 列表页

目标：

- 实现智能体列表页
- 接入查询与分页
- 打通详情、编辑、授权入口

输出：

- `src/views/admin/agent/index.vue`
- 可能新增少量子组件

依赖：

- `AGENT-01`

验证：

- 列表能正确请求和渲染
- 筛选条件变化能刷新列表

## Task AGENT-03 新建 / 编辑抽屉

目标：

- 实现 `form.vue`
- 打通创建与更新
- 完成 JSON 区块与认证区块

输出：

- `src/views/admin/agent/form.vue`

依赖：

- `AGENT-01`
- `AGENT-02`

验证：

- 新增成功后列表刷新
- 编辑成功后列表刷新

## Task AGENT-04 详情 / 发布 / 下线 / 健康检查

目标：

- 实现详情页
- 实现发布弹窗
- 实现下线动作
- 实现健康检查动作

输出：

- `src/views/admin/agent/detail.vue`
- `src/views/admin/agent/components/publish-dialog.vue`

依赖：

- `AGENT-01`
- `AGENT-03`

验证：

- 详情和历史可加载
- 发布 / 下线 / 巡检成功后状态能刷新

## Task AGENT-05 ACL 授权抽屉

目标：

- 实现 ACL 抽屉
- 接入部门 / 角色 / 用户主体选择
- 打通新增、覆盖、回收

输出：

- `src/views/admin/agent/components/acl-drawer.vue`

依赖：

- `AGENT-01`
- `AGENT-02`

验证：

- 抽屉打开可加载 ACL
- 新增和删除后能刷新

## Task AGENT-06 分类 / 标签管理页

目标：

- 实现分类树
- 实现标签分页
- 打通分类 / 标签 CRUD

输出：

- `src/views/admin/agent-meta/index.vue`
- `src/views/admin/agent-meta/category-form.vue`
- `src/views/admin/agent-meta/tag-form.vue`

依赖：

- `AGENT-01`

验证：

- 分类树与标签页都可正常 CRUD

## Task AGENT-07 集成收口

目标：

- 补充 i18n
- 补充权限指令
- 页面跳转串联
- 清理首期不做项

输出：

- i18n 文件
- 菜单 path 建议
- 最终交互收口

验证：

- `npm run lint:eslint`
- `npm run build`

## 推荐给 Codex 的执行方式

每次只给一个任务，例如：

```text
请按照 work/sepcs/02-agent-list.md 实现智能体列表页，只改与列表页相关的文件。
```

或：

```text
请按照 work/sepcs/04-agent-detail-release.md 实现详情页和发布弹窗，先复用已有 API 封装与消息提示方式。
```

