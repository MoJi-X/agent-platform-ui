# 新建 / 编辑智能体抽屉 Spec

## 1. 页面目标

抽屉承接智能体新增与编辑。

首期目标：

- 支持创建智能体
- 支持编辑智能体基础信息与默认端点信息
- 支持填写认证信息
- 支持 JSON Schema 与 Mapping 配置

## 2. 推荐文件

- `src/views/admin/agent/form.vue`
- `src/api/admin/agent.ts`
- `src/types/agent.ts`

## 3. 打开方式

- 从列表页点击“新增智能体”
- 从列表页点击“编辑”
- 从详情页点击“编辑”

## 4. 模式定义

## 4.1 create 模式

- 调用 `POST /console/agents`
- 抽屉标题：新建智能体
- 默认状态文案：`DRAFT`

## 4.2 edit 模式

- 先调用 `GET /console/agents/{agentId}`
- 回填表单
- 提交时调用 `PUT /console/agents/{agentId}`

## 5. 表单分区

## 5.1 基本信息

字段：

- `agentCode`
- `agentName`
- `frameworkType`
- `visibilityScope`
- `categoryId`
- `tagIds`
- `description`

校验重点：

- `agentCode` 必须符合 `^[a-z][a-z0-9_-]{1,63}$`
- `agentName` 长度 `1..64`
- `description` 长度 `0..500`

## 5.2 Schema 约束

字段：

- `schemaSpecVersion`
- `frameworkConfig`
- `inputSchema`
- `outputSchema`

实现要求：

- 文本域输入 JSON
- 保存前执行 `JSON.parse`
- 解析失败时提示具体区块
- `schemaSpecVersion` 默认 `draft-2020-12`

## 5.3 默认端点

字段：

- `endpointName`
- `protocol`
- `streamMode`
- `timeoutMs`
- `baseUrl`
- `invokePath`
- `healthcheckUrl`
- `enabled`
- `isDefault`

校验重点：

- `protocol` 必填
- `timeoutMs` 推荐 `1000..120000`
- `baseUrl` 必须为绝对 URL
- `invokePath` 必须以 `/` 开头
- `healthcheckUrl` 可空

默认值建议：

- `protocol = HTTP`
- `streamMode = false`
- `timeoutMs = 60000`
- `enabled = true`
- `isDefault = true`

## 5.4 认证与映射

字段：

- `auth.authType`
- `auth.authConfig`
- `auth.credential`
- `headersJson`
- `mappingJson`

实现要求：

- `authType = NONE` 时隐藏敏感凭据区域
- `headersJson` 禁止出现敏感头
- `mappingJson` 支持空对象
- `authConfig` / `credential.secretPayload` 使用 textarea 输入 JSON

## 6. 按认证方式切换字段

## 6.1 `NONE`

- 不展示 credential

## 6.2 `API_KEY`

需要填写：

- `transport`
- `parameterName`
- `credential.secretPayload.apiKey`

## 6.3 `BEARER_TOKEN`

需要填写：

- `headerName`
- `prefix`
- `credential.secretPayload.accessToken` 或等价字段

## 6.4 `BASIC`

需要填写：

- `credential.secretPayload.username`
- `credential.secretPayload.password`

## 6.5 `OAUTH2_CLIENT_CREDENTIALS`

需要填写：

- `tokenUrl`
- `clientId`
- `credential.secretPayload.clientSecret`

## 6.6 `CUSTOM_HEADER`

需要填写：

- `headerName`
- `credential.secretPayload.headerValue`

## 7. 更新模式的特别要求

接口文档明确指出：

- 更新时若携带 `endpoint`，建议按完整对象提交
- 否则可能把已有字段清空

因此编辑模式必须：

1. 先拉取详情
2. 将默认端点完整回填到表单
3. 提交时始终提交完整 `endpoint`

## 8. 分类与标签数据来源

- 分类：`GET /console/agent-categories/tree`
- 标签：首期使用 `GET /console/agent-tags/page?current=1&size=100`

说明：

- 当前没有“标签全量下拉”专用接口，首期先用分页接口兼容

## 9. 按钮行为

- `取消`
  - 关闭抽屉，不保留脏状态
- `保存草稿`
  - create: 创建后刷新列表
  - edit: 更新后刷新列表或详情
- `保存并去发布`
  - 先保存
  - 成功后跳转到详情页
  - 可通过 query 标记 `openPublish=1`

首期不建议“保存后直接调发布接口”，因为还需要让用户确认 `endpointId` 和 `releaseNote`。

## 10. 验收标准

- create / edit 两个模式都可用
- JSON 区块有格式校验
- 不同 `authType` 下字段切换正确
- 编辑模式不会误清空原端点数据
- 保存成功后能刷新上层页面

