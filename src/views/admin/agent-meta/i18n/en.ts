export default {
	agentMeta: {
		title: 'Category And Tag Management',
		categoryTitle: 'Category Management',
		tagTitle: 'Tag Management',
		action: {
			createCategory: 'Create Category',
			editCategory: 'Edit Category',
			deleteCategory: 'Delete Category',
			createTag: 'Create Tag',
			editTag: 'Edit Tag',
			deleteTag: 'Delete Tag',
		},
		field: {
			parentId: 'Parent Category',
			categoryCode: 'Category Code',
			categoryName: 'Category Name',
			sortOrder: 'Sort Order',
			tagCode: 'Tag Code',
			tagName: 'Tag Name',
			tagColor: 'Tag Color',
			status: 'Status',
		},
		table: {
			categoryCode: 'Category Code',
			categoryName: 'Category Name',
			tagCode: 'Tag Code',
			tagName: 'Tag Name',
			tagColor: 'Tag Color',
			status: 'Status',
			sortOrder: 'Sort Order',
		},
		enums: {
			status: {
				active: 'Active',
				inactive: 'Inactive',
			},
		},
		validation: {
			categoryCodeRequired: 'Please enter the category code',
			categoryNameRequired: 'Please enter the category name',
			tagCodeRequired: 'Please enter the tag code',
			tagNameRequired: 'Please enter the tag name',
			tagColorInvalid: 'Please enter a valid color value',
			sortOrderInvalid: 'Sort order must be between 0 and 9999',
		},
	},
};
