export default {
	agentMeta: {
		title: '分类与标签管理',
		categoryTitle: '分类管理',
		tagTitle: '标签管理',
		action: {
			createCategory: '新建分类',
			editCategory: '编辑分类',
			deleteCategory: '删除分类',
			createTag: '新建标签',
			editTag: '编辑标签',
			deleteTag: '删除标签',
		},
		field: {
			parentId: '父级分类',
			categoryCode: '分类编码',
			categoryName: '分类名称',
			sortOrder: '排序',
			tagCode: '标签编码',
			tagName: '标签名称',
			tagColor: '标签颜色',
			status: '状态',
		},
		table: {
			categoryCode: '分类编码',
			categoryName: '分类名称',
			tagCode: '标签编码',
			tagName: '标签名称',
			tagColor: '标签颜色',
			status: '状态',
			sortOrder: '排序',
		},
		enums: {
			status: {
				active: '启用',
				inactive: '停用',
			},
		},
		validation: {
			categoryCodeRequired: '请输入分类编码',
			categoryNameRequired: '请输入分类名称',
			tagCodeRequired: '请输入标签编码',
			tagNameRequired: '请输入标签名称',
			tagColorInvalid: '请输入合法的颜色值',
			sortOrderInvalid: '排序值需在 0 到 9999 之间',
		},
	},
};
