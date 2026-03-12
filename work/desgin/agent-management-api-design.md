# 智能体管理接口设计

## 1. 设计原则

- 控制台接口沿用 pig 现有风格，主入口仍为 `/console/agents`
- 返回体统一建议使用 `R<T>`
- 控制台权限走 `@HasPermission`
- 对象级权限通过服务层查询 `ai_agent_acl`
- 开放注册接口单独暴露，不绑定后台菜单，但必须走 OAuth2 `client_credentials` 或内部网关鉴权
- 第三方 API 认证参数统一走 `endpoint.auth` 结构；敏感值不放在 `headersJson`，由服务层加密后写入凭据表

## 2. 权限码设计

| 权限码 | 说明 |
| --- | --- |
| `ai_agent_view` | 查看智能体 |
| `ai_agent_add` | 新增/注册智能体 |
| `ai_agent_edit` | 修改智能体 |
| `ai_agent_publish` | 发布智能体 |
| `ai_agent_offline` | 下线智能体 |
| `ai_agent_del` | 删除智能体 |
| `ai_agent_grant` | 授权智能体 |
| `ai_agent_category` | 分类管理 |
| `ai_agent_tag` | 标签管理 |

## 3. 前端校验统一约定

### 3.1 范围说明

- 本文中的“范围/格式”优先用于前端校验；当前服务端已明确强校验的主要包括：必填项、枚举项、ID 存在性、URL 合法性、敏感头禁止、ACL 掩码大于 0。
- 除特别说明外，字符串长度均指字符数，不区分中英文。
- JS 端建议把所有 `Long/BigInt` 字段按 `int64` 处理；请求可以传数字或字符串，响应中的主键类字段建议按字符串接收。
- 时间字段统一使用 ISO-8601 / RFC3339 格式，例如 `2026-12-31T23:59:59Z`。

### 3.2 基础类型约定

| 类型名 | 前端建议校验 | 说明 |
| --- | --- | --- |
| `string(int64)` | `^[1-9]\\d{0,18}$` | 正整数 ID，JS 端建议按字符串处理 |
| `string(code)` | `^[a-z][a-z0-9_-]{1,63}$` | 编码类字段，推荐 2 到 64 位，小写字母开头 |
| `string(name)` | 长度 `1..64` | 名称类字段 |
| `string(text)` | 长度 `0..500` | 普通描述/备注类文本 |
| `string(url)` | 绝对 URL，长度 `1..512` | 仅允许 `http://` 或 `https://` |
| `string(path)` | 以 `/` 开头，长度 `1..256` | 上游调用路径 |
| `string(color)` | `^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$` | 颜色值 |
| `integer(page)` | `>= 1` | 分页页码 |
| `integer(pageSize)` | `1..100` | 分页大小 |
| `integer(timeoutMs)` | `1000..120000` | 超时毫秒，数据库仅要求 `> 0`，前端建议收敛到 2 分钟内 |
| `integer(permissionMask)` | `1..255` | 8 位权限掩码 |
| `integer(sortOrder)` | `0..9999` | 排序值 |
| `boolean` | `true / false` | 布尔值 |
| `object` | JSON object | 必须是对象，不能是数组/字符串 |
| `array<T>` | 数组 | 若元素为 ID，建议去重后提交 |

### 3.3 枚举约定

| 字段 | 允许值 | 说明 |
| --- | --- | --- |
| `frameworkType` | `LANGCHAIN` / `DIFY` / `OPENAI_COMPAT` / `CUSTOM` | 当前测试与实现已使用 `OPENAI_COMPAT`；若以 `work/design/agent-management-init.sql` 初始化数据库，需同步检查约束 |
| `schemaSpecVersion` | `draft-2020-12` | 当前推荐值，未传时服务端默认该值 |
| `visibilityScope` | `PRIVATE` / `DEPT` / `PUBLIC` | 可见范围 |
| `status` | `DRAFT` / `PUBLISHED` / `OFFLINE` / `DISABLED` | 智能体状态 |
| `category.status` / `tag.status` | `ACTIVE` / `INACTIVE` | 分类、标签状态 |
| `protocol` | `HTTP` / `SSE` / `WS` | 端点协议 |
| `authType` | `NONE` / `API_KEY` / `BEARER_TOKEN` / `BASIC` / `OAUTH2_CLIENT_CREDENTIALS` / `CUSTOM_HEADER` | 端点认证方式 |
| `healthStatus` | `UNKNOWN` / `HEALTHY` / `UNHEALTHY` | 端点健康状态 |
| `subjectType` | `USER` / `ROLE` / `DEPT` | ACL 主体类型 |
| `grantSource` | `MANUAL` / `ROLE_DEFAULT` / `DEPT_DEFAULT` | ACL 授权来源 |
| `credentialMode` | `INLINE` | 当前一期仅推荐此值 |
| `actionType` | `PUBLISH` / `OFFLINE` | 发布记录动作 |
| `registrationSource` | `CONSOLE` / `OPEN_API` / `IMPORT` | 注册来源 |

## 4. 公共对象字段定义

### 4.1 `AgentEndpointAuthPayload`

| 字段 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `authType` | `string(enum)` | 否 | 见 3.3 | 不传或传 `NONE` 表示无认证 |
| `authConfig` | `object` | 否 | JSON object | 非敏感认证配置 |
| `authCredentialId` | `string(int64)` | 否 | 正整数 | 复用已有凭据时传入 |
| `credential` | `object` | 否 | 见下表 | 内联敏感凭据 |

#### `credential` 子对象

| 字段 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `credentialMode` | `string(enum)` | 是 | `INLINE` | 当前一期仅支持内联 |
| `credentialCode` | `string(code)` | 否 | 2..64 | 不传则服务端自动生成 |
| `credentialName` | `string(name)` | 否 | 1..64 | 不传则默认同 `credentialCode` |
| `secretPayload` | `object` | 是 | JSON object | 结构由 `authType` 决定 |

#### `authType` 对应字段要求

| `authType` | `authConfig` 要求 | `credential.secretPayload` 要求 |
| --- | --- | --- |
| `NONE` | 可不传 | 可不传 |
| `API_KEY` | `transport: HEADER/QUERY`；`parameterName: 1..64`；`prefix: 0..32` 可选 | 必须包含 `apiKey` |
| `BEARER_TOKEN` | `headerName: 1..64` 可选，默认 `Authorization`；`prefix: 0..32` 可选，默认 `Bearer ` | 必须至少包含 `accessToken` / `bearerToken` / `token` 之一 |
| `BASIC` | 可不传 | 必须包含 `username`、`password` |
| `OAUTH2_CLIENT_CREDENTIALS` | 必须包含 `tokenUrl:string(url)`、`clientId:1..128`；`scopes:string[]` 可选；`audience:0..128` 可选；`headerName`/`prefix` 可选 | 必须包含 `clientSecret` |
| `CUSTOM_HEADER` | 建议包含 `headerName: 1..64` | 必须包含 `headerValue` |

### 4.2 `AgentEndpointPayload`

| 字段 | 类型 | 注册必填 | 更新携带 `endpoint` 时 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `endpointId` | `string(int64)` | 否 | 否 | 正整数 | 更新已有端点时传入；不传视为新增端点 |
| `endpointName` | `string(name)` | 否 | 否 | 1..64 | 不传时服务端默认 `default` |
| `protocol` | `string(enum)` | 是 | 是 | `HTTP / SSE / WS` | |
| `streamMode` | `boolean` | 是 | 是 | `true / false` | |
| `baseUrl` | `string(url)` | 是 | 是 | `http(s)://...`，1..512 | 服务端会校验 URL |
| `invokePath` | `string(path)` | 是 | 是 | 以 `/` 开头，1..256 | |
| `healthcheckUrl` | `string(url)` | 否 | 否 | 绝对 URL，1..512 | 不传则健康检查接口不可用 |
| `timeoutMs` | `integer(timeoutMs)` | 是 | 是 | `1000..120000` | 服务端实际只限制 `> 0` |
| `auth` | `object` | 否 | 否 | 见 4.1 | |
| `headersJson` | `object` | 否 | 否 | JSON object | 仅允许非敏感静态头；禁止 `Authorization`、`X-API-Key`、`Api-Key`、`X-Auth-Token` 等敏感头 |
| `mappingJson` | `object` | 否 | 否 | JSON object | 请求字段映射模板 |
| `enabled` | `boolean` | 否 | 否 | `true / false` | 不传默认 `true` |
| `isDefault` | `boolean` | 否 | 否 | `true / false` | 不传默认 `true` |

### 4.3 `AgentRegisterPayload` / `AgentUpdatePayload`

| 字段 | 类型 | 注册 | 更新 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `agentCode` | `string(code)` | 必填 | 不支持 | 2..64 | 全局唯一 |
| `agentName` | `string(name)` | 必填 | 可选 | 1..64 | |
| `description` | `string(text)` | 可选 | 可选 | 0..500 | |
| `frameworkType` | `string(enum)` | 必填 | 可选 | 见 3.3 | |
| `frameworkConfig` | `object` | 可选 | 可选 | JSON object | 框架扩展配置 |
| `schemaSpecVersion` | `string(enum)` | 可选 | 可选 | 当前推荐 `draft-2020-12` | 不传时服务端默认该值 |
| `inputSchema` | `object` | 可选 | 可选 | JSON object | 输入 JSON Schema |
| `outputSchema` | `object` | 可选 | 可选 | JSON object | 输出 JSON Schema |
| `metadataJson` | `object` | 可选 | 可选 | JSON object | 扩展元数据 |
| `visibilityScope` | `string(enum)` | 必填 | 可选 | 见 3.3 | |
| `categoryId` | `string(int64)` | 可选 | 可选 | 正整数 | 服务端会校验是否存在 |
| `tagIds` | `array<string(int64)>` | 可选 | 可选 | 最多建议 `50` 个 | 服务端会去重并校验存在性 |
| `ownerDeptId` | `string(int64)` | 仅开放注册可选 | 不支持 | 正整数 | 控制台注册默认取当前登录人部门；开放注册时若传入需通过服务端白名单/映射校验 |
| `defaultEndpointId` | `string(int64)` | 不支持 | 可选 | 正整数 | 必须属于当前智能体 |
| `endpoint` | `object` | 必填 | 可选 | 见 4.2 | 更新时一旦传入，按完整端点对象校验 |

说明：

- `PUT /console/agents/{agentId}` 为局部更新，但如果携带 `endpoint`，建议前端仍按完整端点对象提交，避免必填字段缺失。
- 更新时若携带 `endpoint` 但不携带 `auth`，当前服务实现会按 `NONE` 处理并清空认证引用。
- 更新时若携带 `endpoint` 但省略 `headersJson`、`mappingJson`、`enabled`、`isDefault`，当前服务实现可能按空对象或默认值覆盖原值。
- `tagIds` 为空数组表示清空标签；不传表示不更新标签。

### 4.4 `AgentPublishPayload` / `AgentOfflinePayload`

| 字段 | 类型 | 发布必填 | 下线必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `endpointId` | `string(int64)` | 是 | 否 | 正整数 | 发布时指定生效端点 |
| `releaseNote` | `string(text)` | 否 | 否 | 0..200 | 发布/下线说明 |

### 4.5 `AgentAclGrantPayload`

| 字段 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `subjectType` | `string(enum)` | 是 | `USER / ROLE / DEPT` | ACL 主体类型 |
| `subjectId` | `string(int64)` | 是 | 正整数 | 主体 ID |
| `permissionMask` | `integer(permissionMask)` | 是 | `1..255` | 权限掩码 |
| `grantSource` | `string(enum)` | 否 | `MANUAL / ROLE_DEFAULT / DEPT_DEFAULT` | 不传默认 `MANUAL` |
| `expiresAt` | `datetime` | 否 | ISO-8601 | 失效时间，必须晚于当前时间 |
| `remarks` | `string(text)` | 否 | 0..200 | 备注 |

权限位说明：

| 掩码 | 权限 |
| --- | --- |
| `1` | `VIEW` |
| `2` | `EDIT` |
| `4` | `PUBLISH` |
| `8` | `DELETE` |
| `16` | `GRANT` |
| `32` | `INVOKE` |
| `64` | `DATA_VIEW` |
| `128` | `DATA_EDIT` |

### 4.6 `AgentCategoryPayload`

| 字段 | 类型 | 创建必填 | 更新必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `parentId` | `string(int64)` | 否 | 否 | 正整数 | 根节点可不传 |
| `categoryCode` | `string(code)` | 是 | 是 | 2..64 | 全局唯一 |
| `categoryName` | `string(name)` | 是 | 是 | 1..64 | 同级唯一 |
| `sortOrder` | `integer(sortOrder)` | 否 | 否 | `0..9999` | 不传默认 `0` |
| `status` | `string(enum)` | 否 | 否 | `ACTIVE / INACTIVE` | 不传默认 `ACTIVE` |

### 4.7 `AgentTagPayload`

| 字段 | 类型 | 创建必填 | 更新必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `tagCode` | `string(code)` | 是 | 是 | 2..64 | 全局唯一 |
| `tagName` | `string(name)` | 是 | 是 | 1..64 | 全局唯一 |
| `tagColor` | `string(color)` | 否 | 否 | 例如 `#2563eb` | |
| `status` | `string(enum)` | 否 | 否 | `ACTIVE / INACTIVE` | 不传默认 `ACTIVE` |

### 4.8 通用响应包装

#### `R<T>`

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `code` | `integer` | 成功固定 `0` | 业务状态码 |
| `msg` | `string \| null` | 0..200 | 错误提示或空 |
| `data` | `T \| null` | - | 业务数据 |

#### `Page<T>`

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `records` | `array<T>` | - | 当前页数据 |
| `total` | `integer` | `>= 0` | 总条数 |
| `size` | `integer` | `1..100` | 每页条数 |
| `current` | `integer` | `>= 1` | 当前页码 |
| `pages` | `integer` | `>= 0` | 总页数 |

## 5. 控制台接口

### 5.1 智能体主体

| 方法 | 路径 | 权限码 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/console/agents` | `ai_agent_add` | 控制台注册智能体 |
| `PUT` | `/console/agents/{agentId}` | `ai_agent_edit` | 修改智能体 |
| `GET` | `/console/agents` 或 `/console/agents/page` | `ai_agent_view` | 分页查询 |
| `GET` | `/console/agents/{agentId}` | `ai_agent_view` | 智能体详情 |
| `DELETE` | `/console/agents/{agentId}` | `ai_agent_del` | 删除智能体 |

### `POST /console/agents`

请求体：复用 4.3 `AgentRegisterPayload`。

响应：`R<AgentRegistrationVO>`

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `data.agentId` | `string(int64)` | 正整数 | 智能体主键 |
| `data.agentCode` | `string(code)` | 2..64 | 智能体编码 |
| `data.status` | `string(enum)` | 固定 `DRAFT` | 注册后默认草稿 |
| `data.registrationSource` | `string(enum)` | 固定 `CONSOLE` | 注册来源 |

服务规则：

- `ownerUserId` 默认取当前登录用户。
- `ownerDeptId` 默认取当前登录用户所属部门。
- 若 `endpoint.auth.credential.credentialMode=INLINE`，服务端先加密写入 `ai_agent_credential`。
- `headersJson` 不得承载明文认证密钥。
- 同步创建默认端点。
- 写入操作日志 `REGISTER`。

### `PUT /console/agents/{agentId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

请求体：复用 4.3 `AgentUpdatePayload`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示更新成功 |

服务规则：

- 仅 owner、超级管理员、部门管理员或 ACL 拥有 `EDIT` 的主体可修改。
- 修改成功写操作日志 `UPDATE`。

### `GET /console/agents` 或 `GET /console/agents/page`

Query 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `current` | `integer(page)` | 否 | `>= 1` | 默认建议 `1` |
| `size` | `integer(pageSize)` | 否 | `1..100` | 默认建议 `10` 或 `20` |
| `keyword` | `string` | 否 | 长度 `0..64` | 名称/编码关键字，模糊匹配 |
| `status` | `string(enum)` | 否 | 见 3.3 | 智能体状态 |
| `frameworkType` | `string(enum)` | 否 | 见 3.3 | 框架类型 |
| `categoryId` | `string(int64)` | 否 | 正整数 | 分类筛选 |
| `tagId` | `string(int64)` | 否 | 正整数 | 标签筛选 |
| `ownerDeptId` | `string(int64)` | 否 | 正整数 | 归属部门筛选 |
| `onlyMine` | `boolean` | 否 | `true / false` | 仅看我创建 |
| `onlyAuthorized` | `boolean` | 否 | `true / false` | 仅看我有 ACL 的数据，当前实现中可视为预留筛选参数 |

响应：`R<Page<AgentListItem>>`

`data.records[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `agentId` | `string(int64)` | 正整数 | |
| `agentCode` | `string(code)` | 2..64 | |
| `agentName` | `string(name)` | 1..64 | |
| `frameworkType` | `string(enum)` | 见 3.3 | |
| `status` | `string(enum)` | 见 3.3 | |
| `visibilityScope` | `string(enum)` | 见 3.3 | |
| `ownerUserId` | `string(int64)` | 正整数 | |
| `ownerDeptId` | `string(int64)` | 正整数 | |
| `categoryId` | `string(int64) \| null` | 正整数或空 | |
| `categoryName` | `string \| null` | 0..64 | |
| `tagNames` | `array<string>` | 最多建议 `50` 个 | 标签名列表 |
| `healthStatus` | `string(enum) \| null` | `UNKNOWN / HEALTHY / UNHEALTHY` | 默认端点健康状态 |
| `publishedAt` | `datetime \| null` | ISO-8601 | |
| `updatedAt` | `datetime` | ISO-8601 | |
| `myPermMask` | `integer(permissionMask)` | `0..255` | 当前用户对该智能体的权限合集 |

数据隔离规则：

- `ROLE_ADMIN` 返回全部。
- `ROLE_AGENT_DEPT_ADMIN` 返回本部门及子部门。
- 开发者默认返回本人创建 + 本人/角色/部门 ACL 授权的数据。
- 观察者默认只返回 ACL 允许查看的数据。

### `GET /console/agents/{agentId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

响应：`R<AgentDetailVO>`

顶层字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `data.agentId` | `string(int64)` | 正整数 | |
| `data.agentCode` | `string(code)` | 2..64 | |
| `data.agentName` | `string(name)` | 1..64 | |
| `data.description` | `string` | 0..500 | |
| `data.frameworkType` | `string(enum)` | 见 3.3 | |
| `data.frameworkConfig` | `object` | JSON object | |
| `data.schemaSpecVersion` | `string(enum)` | 当前推荐 `draft-2020-12` | |
| `data.inputSchema` | `object` | JSON object | |
| `data.outputSchema` | `object` | JSON object | |
| `data.status` | `string(enum)` | 见 3.3 | |
| `data.visibilityScope` | `string(enum)` | 见 3.3 | |
| `data.ownerUserId` | `string(int64)` | 正整数 | |
| `data.ownerDeptId` | `string(int64)` | 正整数 | |
| `data.categoryId` | `string(int64) \| null` | 正整数或空 | |
| `data.categoryName` | `string \| null` | 0..64 | |
| `data.defaultEndpointId` | `string(int64) \| null` | 正整数或空 | |
| `data.currentReleaseId` | `string(int64) \| null` | 正整数或空 | |
| `data.healthStatus` | `string(enum) \| null` | 见 3.3 | 默认端点健康状态 |
| `data.publishedAt` | `datetime \| null` | ISO-8601 | |
| `data.offlineAt` | `datetime \| null` | ISO-8601 | |
| `data.updatedAt` | `datetime \| null` | ISO-8601 | |
| `data.myPermMask` | `integer(permissionMask)` | `0..255` | 当前用户权限合集 |

`data.category` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `categoryId` | `string(int64)` | 正整数 | |
| `parentId` | `string(int64) \| null` | 正整数或空 | |
| `categoryCode` | `string(code)` | 2..64 | |
| `categoryName` | `string(name)` | 1..64 | |
| `status` | `string(enum)` | `ACTIVE / INACTIVE` | |
| `sortOrder` | `integer(sortOrder) \| null` | `0..9999` | |

`data.tags[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `tagId` | `string(int64)` | 正整数 | |
| `tagCode` | `string(code)` | 2..64 | |
| `tagName` | `string(name)` | 1..64 | |
| `tagColor` | `string(color) \| null` | Hex 颜色值或空 | |
| `status` | `string(enum)` | `ACTIVE / INACTIVE` | |

`data.currentRelease` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `releaseId` | `string(int64)` | 正整数 | |
| `agentId` | `string(int64)` | 正整数 | |
| `endpointId` | `string(int64) \| null` | 正整数或空 | |
| `releaseNo` | `integer` | `>= 1` | |
| `actionType` | `string(enum)` | `PUBLISH / OFFLINE` | |
| `releaseNote` | `string \| null` | 0..200 | |
| `operatorUserId` | `string(int64)` | 正整数 | |
| `createdAt` | `datetime` | ISO-8601 | |

`data.endpoints[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `endpointId` | `string(int64)` | 正整数 | |
| `endpointName` | `string(name)` | 1..64 | |
| `frameworkType` | `string(enum)` | 见 3.3 | |
| `protocol` | `string(enum)` | `HTTP / SSE / WS` | |
| `streamMode` | `boolean` | `true / false` | |
| `baseUrl` | `string(url)` | 绝对 URL | |
| `invokePath` | `string(path)` | 以 `/` 开头 | |
| `healthcheckUrl` | `string(url) \| null` | 绝对 URL 或空 | |
| `timeoutMs` | `integer(timeoutMs)` | `1000..120000` | |
| `authType` | `string(enum)` | 见 3.3 | |
| `authConfig` | `object` | JSON object | 非敏感认证配置 |
| `authCredentialId` | `string(int64) \| null` | 正整数或空 | |
| `secretPayloadMask` | `object \| null` | JSON object | 脱敏后凭据摘要，不返回明文 |
| `headersJson` | `object` | JSON object | |
| `mappingJson` | `object` | JSON object | |
| `healthStatus` | `string(enum)` | `UNKNOWN / HEALTHY / UNHEALTHY` | |
| `lastHealthCheckAt` | `datetime \| null` | ISO-8601 | |
| `lastHealthCheckMessage` | `string \| null` | 0..200 | |
| `enabled` | `boolean` | `true / false` | |
| `isDefault` | `boolean` | `true / false` | |

安全规则：

- 不返回凭据明文。
- `secretPayloadMask` 只返回脱敏摘要。

### `DELETE /console/agents/{agentId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示删除成功 |

规则：

- 建议做软删除。
- 仅 `DELETE` 权限主体可操作。
- 已发布智能体建议要求先下线再删除。

### 5.2 生命周期与端点维护

| 方法 | 路径 | 权限码 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/console/agents/{agentId}/publish` | `ai_agent_publish` | 发布智能体 |
| `POST` | `/console/agents/{agentId}/offline` | `ai_agent_offline` | 下线智能体 |
| `GET` | `/console/agents/{agentId}/releases` | `ai_agent_view` | 发布历史 |
| `POST` | `/console/agents/{agentId}/endpoints/{endpointId}/health-check` | `ai_agent_edit` | 主动健康检查 |

### `POST /console/agents/{agentId}/publish`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

请求体：复用 4.4 `AgentPublishPayload`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示发布成功 |

服务规则：

- 校验 `endpointId` 属于当前智能体。
- 校验端点已启用且健康状态不是 `UNHEALTHY`。
- 落库 `ai_agent_release(action_type=PUBLISH)`。
- 回写 `ai_agent.status=PUBLISHED`。
- 回写 `ai_agent.current_release_id`。
- 写操作日志 `PUBLISH`。

### `POST /console/agents/{agentId}/offline`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

请求体：复用 4.4 `AgentOfflinePayload`，允许空对象 `{}`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示下线成功 |

服务规则：

- 落库 `ai_agent_release(action_type=OFFLINE)`。
- 回写 `ai_agent.status=OFFLINE`。
- 清空 `current_release_id`。
- 写操作日志 `OFFLINE`。

### `GET /console/agents/{agentId}/releases`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

响应：`R<array<AgentReleaseVO>>`

`data[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `releaseId` | `string(int64)` | 正整数 | |
| `agentId` | `string(int64)` | 正整数 | |
| `endpointId` | `string(int64) \| null` | 正整数或空 | |
| `releaseNo` | `integer` | `>= 1` | |
| `actionType` | `string(enum)` | `PUBLISH / OFFLINE` | |
| `releaseNote` | `string \| null` | 0..200 | |
| `operatorUserId` | `string(int64)` | 正整数 | |
| `createdAt` | `datetime` | ISO-8601 | |

### `POST /console/agents/{agentId}/endpoints/{endpointId}/health-check`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |
| `endpointId` | `string(int64)` | 是 | 正整数 | 端点 ID |

请求体：无。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示健康，`false` 表示检查完成但不健康 |

规则：

- 需要 `EDIT` 或 `PUBLISH` 对象权限。
- `healthcheckUrl` 为空时服务端返回失败。
- 会回写端点 `healthStatus`、`lastHealthCheckAt`、`lastHealthCheckMessage`。

### 5.3 授权

| 方法 | 路径 | 权限码 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/console/agents/{agentId}/acl` | `ai_agent_grant` | 查看 ACL |
| `POST` | `/console/agents/{agentId}/acl` | `ai_agent_grant` | 新增或覆盖授权 |
| `DELETE` | `/console/agents/{agentId}/acl` | `ai_agent_grant` | 回收授权 |

### `GET /console/agents/{agentId}/acl`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

响应：`R<array<AgentAclVO>>`

`data[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `aclId` | `string(int64)` | 正整数 | |
| `agentId` | `string(int64)` | 正整数 | |
| `subjectType` | `string(enum)` | `USER / ROLE / DEPT` | |
| `subjectId` | `string(int64)` | 正整数 | |
| `permissionMask` | `integer(permissionMask)` | `1..255` | |
| `grantSource` | `string(enum)` | `MANUAL / ROLE_DEFAULT / DEPT_DEFAULT` | |
| `expiresAt` | `datetime \| null` | ISO-8601 | |
| `remarks` | `string \| null` | 0..200 | |
| `grantedBy` | `string(int64) \| null` | 正整数或空 | |
| `createdAt` | `datetime` | ISO-8601 | |

### `POST /console/agents/{agentId}/acl`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

请求体：复用 4.5 `AgentAclGrantPayload`。

示例：

```json
{
  "subjectType": "DEPT",
  "subjectId": 7,
  "permissionMask": 39,
  "grantSource": "MANUAL",
  "expiresAt": "2026-12-31T23:59:59Z",
  "remarks": "研发部可查看、编辑、发布、调用"
}
```

说明：

- `39 = VIEW(1) + EDIT(2) + PUBLISH(4) + INVOKE(32)`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示授权成功 |

### `DELETE /console/agents/{agentId}/acl`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `agentId` | `string(int64)` | 是 | 正整数 | 智能体 ID |

Query 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `subjectType` | `string(enum)` | 是 | `USER / ROLE / DEPT` | 主体类型 |
| `subjectId` | `string(int64)` | 是 | 正整数 | 主体 ID |

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示回收成功 |

### 5.4 分类管理

| 方法 | 路径 | 权限码 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/console/agent-categories/tree` | `ai_agent_view` | 分类树 |
| `POST` | `/console/agent-categories` | `ai_agent_category` | 新增分类 |
| `PUT` | `/console/agent-categories/{categoryId}` | `ai_agent_category` | 修改分类 |
| `DELETE` | `/console/agent-categories/{categoryId}` | `ai_agent_category` | 删除分类 |

### `GET /console/agent-categories/tree`

请求参数：无。

响应：`R<array<AgentCategoryVO>>`

`data[]` / `children[]` 递归字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `categoryId` | `string(int64)` | 正整数 | |
| `parentId` | `string(int64) \| null` | 正整数或空 | 根节点为空 |
| `categoryCode` | `string(code)` | 2..64 | |
| `categoryName` | `string(name)` | 1..64 | |
| `status` | `string(enum)` | `ACTIVE / INACTIVE` | |
| `sortOrder` | `integer(sortOrder)` | `0..9999` | |
| `children` | `array<AgentCategoryVO>` | 递归结构 | 子节点列表 |

### `POST /console/agent-categories`

请求体：复用 4.6 `AgentCategoryPayload`。

响应：`R<string(int64)>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `string(int64)` | 新建分类 ID |

规则：

- `categoryCode` 全局唯一。
- 同一 `parentId` 下 `categoryName` 唯一。

### `PUT /console/agent-categories/{categoryId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `categoryId` | `string(int64)` | 是 | 正整数 | 分类 ID |

请求体：复用 4.6 `AgentCategoryPayload`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示修改成功 |

### `DELETE /console/agent-categories/{categoryId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `categoryId` | `string(int64)` | 是 | 正整数 | 分类 ID |

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示删除成功 |

规则：

- 存在子分类时不可删。
- 被智能体引用时不可删。

### 5.5 标签管理

| 方法 | 路径 | 权限码 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/console/agent-tags/page` | `ai_agent_view` | 标签分页 |
| `POST` | `/console/agent-tags` | `ai_agent_tag` | 新增标签 |
| `PUT` | `/console/agent-tags/{tagId}` | `ai_agent_tag` | 修改标签 |
| `DELETE` | `/console/agent-tags/{tagId}` | `ai_agent_tag` | 删除标签 |

### `GET /console/agent-tags/page`

Query 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `current` | `integer(page)` | 否 | `>= 1` | 默认建议 `1` |
| `size` | `integer(pageSize)` | 否 | `1..100` | 默认建议 `10` 或 `20` |
| `keyword` | `string` | 否 | 长度 `0..64` | 按 `tagName` 模糊查询 |
| `status` | `string(enum)` | 否 | `ACTIVE / INACTIVE` | 状态筛选 |

响应：`R<Page<AgentTagVO>>`

`data.records[]` 字段：

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `tagId` | `string(int64)` | 正整数 | |
| `tagCode` | `string(code)` | 2..64 | |
| `tagName` | `string(name)` | 1..64 | |
| `tagColor` | `string(color) \| null` | Hex 或空 | |
| `status` | `string(enum)` | `ACTIVE / INACTIVE` | |

### `POST /console/agent-tags`

请求体：复用 4.7 `AgentTagPayload`。

响应：`R<string(int64)>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `string(int64)` | 新建标签 ID |

规则：

- `tagCode` 全局唯一。
- `tagName` 全局唯一。

### `PUT /console/agent-tags/{tagId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `tagId` | `string(int64)` | 是 | 正整数 | 标签 ID |

请求体：复用 4.7 `AgentTagPayload`。

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示修改成功 |

### `DELETE /console/agent-tags/{tagId}`

Path 参数：

| 参数 | 类型 | 必填 | 范围/格式 | 说明 |
| --- | --- | --- | --- | --- |
| `tagId` | `string(int64)` | 是 | 正整数 | 标签 ID |

响应：`R<boolean>`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `boolean` | `true` 表示删除成功 |

规则：

- 被智能体引用时不可删。

## 6. 开放注册 API

### 6.1 路径与认证

- `POST /open-api/agents/register`
- 必须走 OAuth2 `client_credentials` 或内部网关签名认证。
- 不允许匿名注册。

### `POST /open-api/agents/register`

请求体：复用 4.3 `AgentRegisterPayload`。

与控制台注册的差异：

| 字段 | 控制台注册 | 开放注册 |
| --- | --- | --- |
| `ownerDeptId` | 通常忽略，默认取当前登录人部门 | 可选，但若传入必须经过服务端白名单/映射校验 |
| `registrationSource` | 固定 `CONSOLE` | 固定 `OPEN_API` |
| 发布能力 | 不支持注册即发布 | 同样不支持注册即发布 |

响应：`R<AgentRegistrationVO>`

| 字段 | 类型 | 范围/格式 | 说明 |
| --- | --- | --- | --- |
| `data.agentId` | `string(int64)` | 正整数 | 智能体主键 |
| `data.agentCode` | `string(code)` | 2..64 | 智能体编码 |
| `data.status` | `string(enum)` | 固定 `DRAFT` | 注册后默认草稿 |
| `data.registrationSource` | `string(enum)` | 固定 `OPEN_API` | 注册来源 |

行为约束：

- 开放注册成功后默认进入 `DRAFT`。
- 不能直接发布，必须由控制台或具备发布权限的服务调用发布接口。
- 记录 `registration_client_id`。
- 若携带 `endpoint.auth.credential`，先加密落到 `ai_agent_credential`。
- 写 `ai_agent_operation_log(operation_type=REGISTER, request_source=OPEN_API)`。

## 7. 内部接口建议

这些接口不直接给前端消费，本节仅保留设计说明，不展开前端字段校验：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `POST` | `/internal/agents/{agentId}/health-check` | 主动刷新健康状态 |
| `GET` | `/internal/agents/{agentId}/route` | 供网关获取可用路由 |
| `GET` | `/internal/agents/authorized` | 供其他服务批量查询某用户可访问智能体 |

## 8. 服务层对象级校验建议

### 8.1 查看

满足其一即可：

- `ROLE_ADMIN`
- owner
- 部门管理员且目标属于本部门/子部门
- ACL 合并后含 `VIEW`

### 8.2 编辑

满足其一即可：

- `ROLE_ADMIN`
- owner
- 部门管理员且目标属于本部门/子部门
- ACL 合并后含 `EDIT`

### 8.3 发布/下线

满足其一即可：

- `ROLE_ADMIN`
- owner
- 部门管理员且目标属于本部门/子部门
- ACL 合并后含 `PUBLISH`

### 8.4 授权

满足其一即可：

- `ROLE_ADMIN`
- owner
- 部门管理员且目标属于本部门/子部门
- ACL 合并后含 `GRANT`

## 9. DTO 建议

建议拆出以下 DTO：

- `AgentRegisterDTO`
- `AgentUpdateDTO`
- `AgentEndpointDTO`
- `AgentEndpointAuthDTO`
- `AgentCredentialInlineDTO`
- `AgentPublishDTO`
- `AgentOfflineDTO`
- `AgentAclGrantDTO`
- `AgentCategoryDTO`
- `AgentTagDTO`
- `AgentQueryDTO`

其中：

- 注册 DTO 和开放注册 DTO 可以复用一套字段，只是校验规则不同。
- `AgentEndpointDTO` 内建议嵌套 `auth`，服务层负责把敏感数据拆到凭据表。
- 发布 DTO 不再要求版本号，只要求 `endpointId + releaseNote`。
- ACL DTO 直接使用 `permissionMask`，避免前后端传多组布尔值。
