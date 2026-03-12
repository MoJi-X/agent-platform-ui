# AGENTS.md

本文件用于约束后续 Codex 在本仓库中的分析、设计、编码、验证与交付方式。

未被本文件覆盖的细节，优先级如下：

1. 仓库现有实现与目录约定
2. `.eslintrc.js`、`.prettierrc.cjs`、`tsconfig.json`、`vite.config.ts`
3. 阿里前端开发规范与 F2E 规约

## 1. 项目定位

- 本项目是基于 `Vue 3 + TypeScript + Vite` 的后台管理前端。
- UI 组件库使用 `Element Plus`。
- 状态管理使用 `Pinia`。
- 路由使用 `Vue Router`，并且以“后端返回菜单驱动动态路由”为主。
- 请求层统一基于 `Axios`，封装在 `src/utils/request.ts`。
- 样式体系为 `Element Plus + Tailwind CSS + SCSS`。
- 国际化使用 `vue-i18n`。

## 2. 运行与构建

- Node.js 版本要求：`>= 18`
- npm 版本要求：`>= 8`
- 常用命令：
- `npm run dev`：本地开发
- `npm run build`：生产构建
- `npm run build:docker`：Docker 构建产物输出
- `npm run lint:eslint`：执行 ESLint 修复
- `npm run prettier`：执行 Prettier 格式化

## 3. 项目结构

- `src/main.ts`：应用入口，注册全局组件、指令、Pinia、Router、i18n、Element Plus。
- `src/api`：接口定义层，按业务域拆分，禁止在页面中直接写请求。
- `src/views`：业务页面层，后台管理页面主要放在这里。
- `src/components`：可复用公共组件。
- `src/hooks`：通用业务 Hook，例如表格、消息提示等。
- `src/stores`：Pinia 状态管理。
- `src/router`：静态路由、动态路由装配、后端菜单路由转换。
- `src/utils`：请求、存储、校验、时间处理等公共工具。
- `src/types`：公共类型定义。
- `src/theme`：全局主题、Tailwind 与 SCSS 入口。
- `public`：静态资源。
- `work`：需求草稿、接口设计、静态原型，仅用于研发对齐，不参与生产构建。

## 4. 代码规范

### 4.1 总原则

- 遵循高内聚、低耦合、单一职责。
- 优先复用现有能力，不重复造轮子。
- 新增代码必须先参考相邻模块的现有写法，再决定是否抽象。
- 不为“看起来更先进”而引入不符合当前仓库风格的新框架、新范式、新依赖。
- 新增文件默认使用 `UTF-8` 编码。

### 4.2 TypeScript 与 Vue

- 新增页面组件统一使用 `<script setup lang="ts">`。
- 新增代码优先使用明确的 `interface` / `type`，不要滥用 `any`、`Object`。
- 只有在兼容旧代码或第三方库返回值不稳定时，才允许局部使用 `any`。
- 优先使用 `async/await`，避免多层 `.then()` 链式回调。
- 组件超过单一职责时必须拆分，列表页与弹窗表单优先拆成 `index.vue` + `form.vue`。
- 复杂弹窗、树、编辑器等重组件，优先按现有习惯使用 `defineAsyncComponent` 懒加载。

### 4.3 命名规范

- 目录名优先使用 `kebab-case`，与路由路径、菜单路径保持一致。
- 页面入口文件优先使用 `index.vue`。
- 弹窗表单优先使用 `form.vue`。
- Hook 文件使用 `useXxx.ts` 风格。
- Store 保持现有 `useXxx` 风格导出。
- 类型、常量、枚举命名必须语义化，不允许 `data1`、`tmp`、`list2` 这类弱语义命名。

### 4.4 请求与数据规范

- 所有 HTTP 请求必须通过 `src/utils/request.ts` 发起，禁止在页面中直接使用 `axios` 或 `fetch`。
- 新接口一律先落在 `src/api/<domain>`，页面只调用 API 方法，不拼接 URL。
- 列表页优先复用 `src/hooks/table.ts` 的 `useTable`，保持分页、排序、刷新行为一致。
- 统一使用 `useMessage`、`useMessageBox` 处理提示与确认框，不直接散落调用底层消息组件。
- 表单校验优先复用 `src/utils/validate.ts` 中已有规则。

### 4.5 路由、权限与国际化

- 本项目以“后端菜单控制路由”为主；新增后台业务页面时，先确认是否由后端菜单返回路径驱动。
- 仅当页面属于纯前端静态路由时，才修改 `src/router/route.ts`。
- 新增按钮权限必须使用现有指令体系，例如 `v-auth`。
- 菜单路径、页面路径、文件目录尽量保持一致，便于动态路由装配。
- 所在模块已接入 i18n 时，新增文案必须同步补充国际化资源，禁止硬编码散落中文字符串。

### 4.6 样式规范

- 优先复用 Element Plus 组件、现有主题变量和 Tailwind 工具类。
- 样式实现先保证一致性，再考虑局部视觉增强。
- 避免大段内联样式；临时布局调整可以少量使用内联样式，长期代码应沉淀为类名或局部样式。
- 不随意改动全局主题和通用组件样式，除非任务目标就是全局设计调整。

### 4.7 格式与质量门槛

- 格式化以仓库 Prettier 配置为准：
- 使用 `tab`
- 使用单引号
- 保留分号
- `printWidth = 150`
- `endOfLine = lf`
- 质量检查以仓库 ESLint 配置为准：
- 禁止保留未使用变量
- 禁止提交 `console`
- 不允许因为赶进度而关闭整个文件的 lint 规则，除非有明确技术理由

## 5. 开发流程

**_ windows开发注意中文编码问题，阅读时请确保文件编码为 UTF-8 _**

1. 先阅读需求、设计稿、接口文档，必要时查看 `work/` 中的原型和设计说明。
2. 在 `src/views`、`src/api`、`src/components` 中查找相似模块，优先沿用现有实现模式。
3. 明确改动边界：页面、接口、路由、权限、i18n、类型、样式分别落在哪一层。
4. 先补齐 API 与类型，再完成页面与交互，最后补权限、国际化和细节状态。
5. 代码完成后至少执行与改动匹配的验证命令。
6. 提交前清理调试代码、死代码、无意义注释和临时 mock。

## 6. 如何完成任务

### 6.1 新增一个标准后台 CRUD 功能时

- 在 `src/api/<domain>` 新增或扩展接口文件。
- 在 `src/views/<domain>/<feature>` 下创建页面目录。
- 列表页优先使用 `index.vue`，弹窗表单优先使用 `form.vue`。
- 表格分页、查询、排序优先接入 `useTable`。
- 消息提示统一使用 `useMessage` / `useMessageBox`。
- 涉及权限的按钮与操作统一接入 `v-auth`。
- 模块已存在 i18n 时，必须同步补齐 `zh-cn.ts` 与 `en.ts`。

### 6.2 新增一个公共能力时

- 可复用 UI 组件放到 `src/components`。
- 与页面无关的通用逻辑放到 `src/hooks` 或 `src/utils`。
- 跨页面共享状态放到 `src/stores`。
- 多个业务共同使用的类型放到 `src/types`。

### 6.3 修改路由时

- 先确认该页面属于后端菜单路由还是前端静态路由。
- 后端菜单路由优先保证“菜单 path”和“`src/views` 文件路径”可映射。
- 前端静态路由才修改 `src/router/route.ts`。

### 6.4 修改样式时

- 优先局部改动，避免牵动全局主题。
- 优先复用已有布局类、主题变量、Element Plus 组件能力。
- 没有明确要求时，不做大面积视觉重构。

## 7. 禁止事项

- 禁止在页面中直接写裸 `axios` / `fetch` 请求。
- 禁止无必要新增依赖。
- 禁止顺手重构无关模块。
- 禁止批量格式化未改动文件。
- 禁止手工修改明显的生成文件，例如 `auto-imports.d.ts`，除非任务明确要求。
- 禁止把原型代码直接放进生产目录而不做工程化整理。

## 8. 任务完成前必须检查

- 改动是否符合现有目录分层。
- 是否复用了 `request`、`useTable`、`useMessage`、权限指令、i18n 等现有能力。
- 是否存在 `console`、死代码、未使用变量、硬编码路径或无类型返回值。
- 是否执行了至少一项有效验证。
- 是否只改了与任务相关的文件。

## 9. 提交规范

- 提交信息采用 Conventional Commits 风格。
- 推荐格式：`feat(scope): summary`、`fix(scope): summary`、`refactor(scope): summary`、`docs(scope): summary`。
- 一次提交只解决一个明确问题，避免把无关修改混在一起。
