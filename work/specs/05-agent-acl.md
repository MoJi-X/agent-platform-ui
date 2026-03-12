# ACL 授权抽屉 Spec

## 1. 组件目标

ACL 授权抽屉负责：

- 查看某个智能体已有 ACL
- 新增或覆盖 ACL
- 回收 ACL

## 2. 推荐文件

- `src/views/admin/agent/components/acl-drawer.vue`

## 3. 打开方式

- 列表页点击“授权”
- 详情页点击“授权管理”

父组件传入：

- `agentId`
- `agentName`
- `agentStatus`
- owner 摘要信息

## 4. 接口依赖

- `GET /console/agents/{agentId}/acl`
- `POST /console/agents/{agentId}/acl`
- `DELETE /console/agents/{agentId}/acl`

复用已有系统 API：

- 部门：`deptTree`
- 角色：`role.list`
- 用户：`user.pageList`

## 5. 表单结构

字段：

- `subjectType`
- `subjectId`
- `permissionKeys`
- `permissionMask`
- `expiresAt`
- `grantSource`
- `remarks`

首期建议：

- `grantSource` 默认 `MANUAL`
- 前端可展示为只读或默认值，不必开放频繁切换

## 6. 主体选择器规则

## 6.1 `DEPT`

- 使用 `deptTree`
- 以树选择器展示

## 6.2 `ROLE`

- 使用 `role.list`
- 以普通下拉展示

## 6.3 `USER`

- 使用 `user.pageList`
- 首期建议做远程搜索
- 搜索字段优先：用户名 / 手机号

## 7. 权限选择设计

不要让用户直接输入 `permissionMask`。

前端展示为多选权限 chips：

- VIEW
- EDIT
- PUBLISH
- DELETE
- GRANT
- INVOKE
- DATA_VIEW
- DATA_EDIT

提交前将选中的权限集合转换为 `permissionMask`。

## 8. 现有 ACL 列表

展示列：

- `subjectType`
- 主体名称
- 权限标签
- `expiresAt`
- 操作

说明：

- 接口未定义主体名称字段，首期可根据本地选项缓存映射显示
- 如果列表接口只返回 `subjectId`，则需要前端补一次名称解析

## 9. 回收动作

根据列表行调用：

- `DELETE /console/agents/{agentId}/acl?subjectType=...&subjectId=...`

执行前：

- 二次确认

执行后：

- 刷新 ACL 列表
- 通知父页面刷新详情或列表

## 10. 验收标准

- 抽屉可打开并正确加载 ACL 列表
- 三种主体类型切换正常
- 权限勾选能正确转换为 `permissionMask`
- 新增 / 覆盖成功后列表立即刷新
- 回收成功后列表立即刷新

