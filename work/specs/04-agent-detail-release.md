# 详情页 / 发布 / 下线 / 健康检查 Spec

## 1. 页面目标

详情页面向发布和运维，负责：

- 展示智能体完整信息
- 展示默认端点状态
- 展示发布历史
- 承接发布、下线、健康检查动作
- 提供 ACL 管理入口

## 2. 推荐文件

- `src/views/admin/agent/detail.vue`
- `src/views/admin/agent/components/publish-dialog.vue`
- `src/views/admin/agent/components/acl-drawer.vue`

## 3. 路由建议

- 路径：`/admin/agent/detail`
- 参数：`query.agentId`

## 4. 接口依赖

- `GET /console/agents/{agentId}`
- `GET /console/agents/{agentId}/releases`
- `POST /console/agents/{agentId}/publish`
- `POST /console/agents/{agentId}/offline`
- `POST /console/agents/{agentId}/endpoints/{endpointId}/health-check`

## 5. 页面结构

## 5.1 Hero 区

展示：

- `agentName`
- `status`
- `visibilityScope`
- `healthStatus`
- `agentId`
- `agentCode`
- owner 信息
- `defaultEndpointId`

操作按钮：

- 编辑
- 授权管理
- 健康检查
- 下线
- 发布

说明：

- `发布` 在 `DRAFT` 或 `OFFLINE` 时可见
- `下线` 在 `PUBLISHED` 时可见

## 5.2 基础信息区

展示：

- `frameworkType`
- `currentReleaseId`
- 分类
- 标签
- `visibilityScope`
- `updatedAt`
- `description`

## 5.3 Input / Output Schema 区

展示：

- `inputSchema`
- `outputSchema`

首期直接使用只读代码块展示，不做 JSON 高亮编辑器。

## 5.4 默认端点区

优先展示默认端点摘要：

- `endpointName`
- `protocol`
- `streamMode`
- `healthStatus`
- `timeoutMs`
- `baseUrl`
- `invokePath`
- `authType`

若后端返回多个端点：

- 首期只突出默认端点
- 其他端点可选做成简单表格

## 5.5 对象级权限摘要

根据 `myPermMask` 直接前端计算展示：

- VIEW
- EDIT
- PUBLISH
- DELETE
- GRANT
- INVOKE

## 5.6 发布历史

表格字段：

- `releaseNo`
- `actionType`
- `releaseNote`
- `endpointId`
- `operatorUserId`
- `createdAt`

## 6. 发布动作

## 6.1 交互方式

建议使用弹窗 `publish-dialog.vue`。

字段：

- `endpointId`
- `releaseNote`

规则：

- `endpointId` 必填
- 只能选择当前智能体下的端点
- 默认选中 `defaultEndpointId`

## 6.2 成功后行为

- 刷新详情
- 刷新发布历史
- 提示成功

## 7. 下线动作

建议使用简单弹窗或 `prompt` 收集 `releaseNote`。

字段：

- `releaseNote`

规则：

- 可为空

成功后：

- 刷新详情
- 刷新发布历史

## 8. 健康检查动作

首期只做“对默认端点执行健康检查”。

逻辑：

1. 找到默认端点
2. 调用 `POST /console/agents/{agentId}/endpoints/{endpointId}/health-check`
3. 成功后刷新详情

若没有默认端点：

- 禁用按钮
- 或点击后提示“未配置默认端点”

## 9. 首期不做项

- 最近操作时间线

原因：

- 接口文档没有提供操作日志查询接口
- 原型中的“最近操作”不能仅靠现有 API 完整还原

## 10. 验收标准

- 页面可根据 `agentId` 正确加载详情和发布历史
- 发布、下线、健康检查动作可执行
- 成功后页面状态会刷新
- `myPermMask` 能正确展示权限摘要
- 缺失默认端点时不出现错误崩溃

