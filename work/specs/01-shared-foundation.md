# Shared Foundation

## 1. 事实来源优先级

1. `work/desgin/agent-management-api-design.md`
2. `work/desgin/agent_management.html`
3. 当前仓库既有实现模式

接口文档定义了真实的请求 / 响应与权限边界，原型只负责补足布局和交互表达。

## 2. 当前模块边界

智能体管理模块包含 5 类对象：

- `Agent`
- `Endpoint`
- `Release`
- `Acl`
- `Category / Tag`

其中：

- `Endpoint` 是 `Agent` 的从属对象，但首期不单独做独立列表页。
- `Release` 只在详情页展示和操作。
- `Acl` 通过抽屉管理，不单独占菜单页。
- `Category / Tag` 合并到一个页面中管理。

## 3. 推荐前端文件职责

## 3.1 类型层

建议在 `src/types/agent.ts` 统一定义：

- `AgentItem`
- `AgentDetail`
- `AgentEndpoint`
- `AgentRelease`
- `AgentAclItem`
- `AgentCategory`
- `AgentTag`
- `AgentRegisterPayload`
- `AgentUpdatePayload`
- `AgentPublishPayload`
- `AgentOfflinePayload`
- `AgentAclGrantPayload`

## 3.2 API 层

建议在 `src/api/admin/agent.ts` 中定义：

- `pageAgents`
- `getAgentDetail`
- `createAgent`
- `updateAgent`
- `deleteAgent`
- `publishAgent`
- `offlineAgent`
- `listAgentReleases`
- `healthCheckEndpoint`
- `listAgentAcl`
- `grantAgentAcl`
- `revokeAgentAcl`

建议在 `src/api/admin/agent-category.ts` 中定义：

- `getAgentCategoryTree`
- `createAgentCategory`
- `updateAgentCategory`
- `deleteAgentCategory`

建议在 `src/api/admin/agent-tag.ts` 中定义：

- `pageAgentTags`
- `createAgentTag`
- `updateAgentTag`
- `deleteAgentTag`

## 3.3 页面层

- `src/views/admin/agent/index.vue`
  - 列表页
- `src/views/admin/agent/form.vue`
  - 新建 / 编辑抽屉
- `src/views/admin/agent/detail.vue`
  - 详情页
- `src/views/admin/agent/components/acl-drawer.vue`
  - ACL 授权抽屉
- `src/views/admin/agent/components/publish-dialog.vue`
  - 发布 / 下线弹窗
- `src/views/admin/agent-meta/index.vue`
  - 分类 / 标签管理页

## 4. 共享实现约束

## 4.1 请求与响应

- 所有接口统一走 `src/utils/request.ts`
- 所有 `int64` 主键在前端统一按 `string` 处理
- 列表页统一复用 `useTable`
- 提示统一使用 `useMessage` / `useMessageBox`

## 4.2 表单和 JSON 处理

- `frameworkConfig`
- `inputSchema`
- `outputSchema`
- `headersJson`
- `mappingJson`
- `authConfig`
- `credential.secretPayload`

上述字段首期统一使用 `textarea + JSON.parse` 模式，不引入新代码编辑器。

## 4.3 状态与权限映射

建议增加一组共享映射常量：

- `AGENT_STATUS_OPTIONS`
- `VISIBILITY_SCOPE_OPTIONS`
- `FRAMEWORK_TYPE_OPTIONS`
- `AUTH_TYPE_OPTIONS`
- `HEALTH_STATUS_OPTIONS`
- `ACL_SUBJECT_TYPE_OPTIONS`

建议增加一组权限位工具：

- `permMaskToKeys(mask)`
- `permKeysToMask(keys)`
- `hasPerm(mask, key)`

权限位定义以接口文档为准：

- `1 = VIEW`
- `2 = EDIT`
- `4 = PUBLISH`
- `8 = DELETE`
- `16 = GRANT`
- `32 = INVOKE`
- `64 = DATA_VIEW`
- `128 = DATA_EDIT`

## 4.4 复用现有系统 API

ACL 主体选择器不要新造接口，优先复用已有系统能力：

- 部门：`src/api/admin/dept.ts` 中的 `deptTree`
- 角色：`src/api/admin/role.ts` 中的 `list` 或 `pageList`
- 用户：`src/api/admin/user.ts` 中的 `pageList`

## 4.5 i18n

首期至少补齐：

- 页面标题
- 表格列名
- 表单字段名
- 状态文案
- 操作文案
- 校验错误文案

## 5. 推荐路由策略

## 5.1 可见菜单

- `/admin/agent/index`
- `/admin/agent-meta/index`

## 5.2 隐藏详情页

- `/admin/agent/detail?agentId=30001`

原因：

- 避免动态路径和后端菜单配置一起上，降低首期复杂度。
- 现有项目中隐藏详情页更适合用 query 携带上下文。

## 6. 数据结构约束

## 6.1 允许值以接口文档为准

尤其注意以下枚举：

- `frameworkType`: `LANGCHAIN / DIFY / OPENAI_COMPAT / CUSTOM`
- `healthStatus`: `UNKNOWN / HEALTHY / UNHEALTHY`
- `status`: `DRAFT / PUBLISHED / OFFLINE / DISABLED`

## 6.2 不要按原型自行扩展枚举

原型里出现了但接口文档未定义的值，首期不要写死到业务逻辑中：

- `SPRING_AI`
- `DEGRADED`

## 7. 共享 UI 约定

- 列表页和管理页保持当前后台系统风格，不做高保真 HTML 原型的逐像素还原。
- 颜色、标签、按钮层级参考现有 `admin` 模块写法。
- 抽屉 / 弹窗优先复用 Element Plus 组件。
- 列表页操作栏优先使用文字按钮，不引入过多自定义图形。

## 8. 首期不强依赖 Pinia

本模块首期不要求新增独立 store。

优先级：

- 组件局部状态
- 父子组件事件通信
- 路由 query 传参

仅当出现跨页面共享筛选条件或缓存编辑态时，再考虑引入 store。

