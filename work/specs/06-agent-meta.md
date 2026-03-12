# 分类 / 标签管理页 Spec

## 1. 页面目标

分类 / 标签管理页是智能体元数据管理工作台，用于：

- 管理分类树
- 管理标签列表
- 给列表页和编辑抽屉提供复用数据源

## 2. 推荐文件

- `src/views/admin/agent-meta/index.vue`
- `src/views/admin/agent-meta/category-form.vue`
- `src/views/admin/agent-meta/tag-form.vue`

## 3. 路由建议

- 路径：`/admin/agent-meta/index`
- 菜单名：分类标签

## 4. 页面布局

页面采用左右分栏：

- 左侧：分类树
- 右侧：标签列表

## 5. 分类管理

## 5.1 接口依赖

- `GET /console/agent-categories/tree`
- `POST /console/agent-categories`
- `PUT /console/agent-categories/{categoryId}`
- `DELETE /console/agent-categories/{categoryId}`

## 5.2 展示字段

- `categoryName`
- `categoryCode`
- `status`
- `sortOrder`
- 子节点数量

## 5.3 交互要求

- 支持展开 / 收起全部
- 支持新增分类
- 支持编辑分类
- 支持删除分类

分类表单字段：

- `parentId`
- `categoryCode`
- `categoryName`
- `sortOrder`
- `status`

## 6. 标签管理

## 6.1 接口依赖

- `GET /console/agent-tags/page`
- `POST /console/agent-tags`
- `PUT /console/agent-tags/{tagId}`
- `DELETE /console/agent-tags/{tagId}`

## 6.2 查询字段

- `keyword`
- `status`

原型中的“颜色筛选”首期不做，因为接口文档没有对应查询参数。

## 6.3 表格字段

- `tagName`
- `tagCode`
- `tagColor`
- `status`
- `updatedAt`
- 操作

首期不展示：

- 关联数

原因：

- 接口文档没有定义该字段

## 6.4 表单字段

- `tagCode`
- `tagName`
- `tagColor`
- `status`

## 7. 首期不做项

- 同步使用次数
- 按使用次数排序
- 批量停用

这些都在原型里出现了，但接口文档没有对应能力。

## 8. 与其他页面的复用关系

- 智能体列表页查询条件需要复用分类和标签
- 智能体抽屉需要复用分类树和标签选项
- 详情页需要复用分类与标签名称展示

因此本页上线后，应把“分类数据获取”和“标签选项获取”提取为可复用 API。

## 9. 验收标准

- 分类树能正确增删改查
- 标签页能正确分页增删改查
- 删除失败时能展示后端错误提示
- 页面数据能被列表页和抽屉复用

