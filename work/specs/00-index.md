# 智能体管理模块 Specs 索引

本目录用于承接 `work/desgin` 下的接口文档和原型，并把它们拆成可直接驱动前端开发的 specs。

## 来源文档

- `work/desgin/agent-management-api-design.md`
- `work/desgin/agent_management.html`

## 本期前端交付范围

1. 智能体列表页
2. 新建 / 编辑智能体抽屉
3. 智能体详情页
4. 发布 / 下线 / 健康检查交互
5. ACL 授权抽屉
6. 分类 / 标签管理页
7. 共用类型、API 封装、权限映射与 i18n

## 推荐代码落点

```text
src/api/admin/agent.ts
src/api/admin/agent-category.ts
src/api/admin/agent-tag.ts
src/types/agent.ts
src/views/admin/agent/index.vue
src/views/admin/agent/detail.vue
src/views/admin/agent/form.vue
src/views/admin/agent/components/acl-drawer.vue
src/views/admin/agent/components/publish-dialog.vue
src/views/admin/agent-meta/index.vue
src/views/admin/agent-meta/category-form.vue
src/views/admin/agent-meta/tag-form.vue
src/views/admin/agent/i18n/zh-cn.ts
src/views/admin/agent/i18n/en.ts
src/views/admin/agent-meta/i18n/zh-cn.ts
src/views/admin/agent-meta/i18n/en.ts
```

## 推荐菜单 / 路由路径

- 列表页：`/admin/agent/index`
- 详情页：`/admin/agent/detail`
- 分类标签页：`/admin/agent-meta/index`

说明：

- 详情页建议使用固定路由 + `query.agentId` 的方式，不建议首期使用动态路径参数。
- 本项目路由主要由后端菜单驱动，菜单 path 应与 `src/views` 文件路径保持可映射关系。

## 规格拆分

- `01-shared-foundation.md`
  - 共享类型、枚举、权限、公共实现约束、推荐文件结构
- `02-agent-list.md`
  - 智能体列表页 spec
- `03-agent-form-drawer.md`
  - 新建 / 编辑智能体抽屉 spec
- `04-agent-detail-release.md`
  - 详情页、发布、下线、健康检查 spec
- `05-agent-acl.md`
  - ACL 授权抽屉 spec
- `06-agent-meta.md`
  - 分类 / 标签管理页 spec
- `07-dev-plan.md`
  - 建议的 Codex 推进顺序与任务切片
- `08-open-questions.md`
  - 当前接口缺口、原型冲突、实现假设

## 使用方式

建议后续让 Codex 一次只实现一个 spec，避免同时改太多文件。

每完成一个 spec，就提交一次 PR，避免一次改太多文件。

推荐顺序：

1. 先做 `01-shared-foundation.md`
2. 再做 `02-agent-list.md`
3. 再做 `03-agent-form-drawer.md`
4. 再做 `04-agent-detail-release.md`
5. 再做 `05-agent-acl.md`
6. 最后做 `06-agent-meta.md`
