<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view agent-list">
			<section class="agent-list__hero">
				<div class="agent-list__hero-main">
					<h2 class="agent-list__title">{{ t('agent.title') }}</h2>
					<p class="agent-list__subtitle">{{ t('agent.subtitle') }}</p>
				</div>
				<div class="agent-list__hero-actions">
					<el-button v-auth="AGENT_PERMISSION_CODES.ADD" type="primary" @click="formRef?.openDialog()">
						{{ t('agent.action.create') }}
					</el-button>
					<el-button v-auth="AGENT_PERMISSION_CODES.CATEGORY" plain @click="goMetaPage('category')">
						{{ t('agentMeta.categoryTitle') }}
					</el-button>
					<el-button v-auth="AGENT_PERMISSION_CODES.TAG" plain @click="goMetaPage('tag')">
						{{ t('agentMeta.tagTitle') }}
					</el-button>
				</div>
			</section>

			<el-alert class="agent-list__summary-alert" :closable="false" show-icon type="info" :title="t('agent.message.summaryTodo')" />

			<el-row v-show="showSearch" class="agent-list__query">
				<el-form ref="queryRef" :inline="true" :model="queryForm" @keyup.enter="getDataList">
					<el-form-item :label="t('agent.field.keyword')" prop="keyword">
						<el-input v-model="queryForm.keyword" clearable :placeholder="t('agent.placeholder.keyword')" />
					</el-form-item>
					<el-form-item :label="t('agent.table.status')" prop="status">
						<el-select v-model="queryForm.status" clearable :placeholder="t('agent.placeholder.status')">
							<el-option v-for="item in AGENT_STATUS_OPTIONS" :key="item.value" :label="t(item.labelKey)" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item :label="t('agent.table.frameworkType')" prop="frameworkType">
						<el-select v-model="queryForm.frameworkType" clearable :placeholder="t('agent.placeholder.frameworkType')">
							<el-option v-for="item in FRAMEWORK_TYPE_OPTIONS" :key="item.value" :label="t(item.labelKey)" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item :label="t('agent.field.categoryId')" prop="categoryId">
						<el-select v-model="queryForm.categoryId" clearable filterable :placeholder="t('agent.placeholder.categoryId')">
							<el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item :label="t('agent.field.tagIds')" prop="tagId">
						<el-select v-model="queryForm.tagId" clearable filterable :placeholder="t('agent.placeholder.tagId')">
							<el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item prop="onlyMine">
						<el-checkbox v-model="queryForm.onlyMine">{{ t('agent.field.onlyMine') }}</el-checkbox>
					</el-form-item>
					<el-form-item prop="onlyAuthorized">
						<el-checkbox v-model="queryForm.onlyAuthorized">{{ t('agent.field.onlyAuthorized') }}</el-checkbox>
					</el-form-item>
					<el-form-item>
						<el-button icon="Search" type="primary" @click="getDataList">{{ t('common.queryBtn') }}</el-button>
						<el-button icon="Refresh" @click="resetQuery">{{ t('common.resetBtn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>

			<div class="agent-list__toolbar">
				<div class="agent-list__toolbar-left">
					<el-button
						v-auth="AGENT_PERMISSION_CODES.DELETE"
						:disabled="multiple"
						icon="Delete"
						type="primary"
						plain
						@click="handleDelete(selectedAgentIds)"
					>
						{{ t('common.delBtn') }}
					</el-button>
				</div>
				<div class="agent-list__toolbar-right">
					<right-toolbar v-model:showSearch="showSearch" @queryTable="getDataList" />
				</div>
			</div>

			<el-table
				v-loading="state.loading"
				:data="state.dataList"
				border
				:cell-style="tableStyle.cellStyle"
				:header-cell-style="tableStyle.headerCellStyle"
				@selection-change="handleSelectionChange"
			>
				<el-table-column type="selection" width="44" />
				<el-table-column :label="t('agent.table.agentId')" prop="agentId" min-width="180" show-overflow-tooltip />
				<el-table-column :label="t('agent.table.agentName')" min-width="240">
					<template #default="scope">
						<div class="agent-list__primary-cell">
							<span class="agent-list__primary-text">{{ scope.row.agentName }}</span>
							<span class="agent-list__secondary-text">{{ scope.row.agentCode }}</span>
							<span v-if="scope.row.description" class="agent-list__description">{{ scope.row.description }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.field.categoryId')" min-width="200">
					<template #default="scope">
						<div class="agent-list__primary-cell">
							<span class="agent-list__primary-text">{{ scope.row.categoryName || t('agent.empty.noCategory') }}</span>
							<div v-if="scope.row.tagNames?.length" class="agent-list__tag-group">
								<el-tag v-for="tag in scope.row.tagNames" :key="tag" effect="plain" size="small">
									{{ tag }}
								</el-tag>
							</div>
							<span v-else class="agent-list__secondary-text">{{ t('agent.empty.noTags') }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.frameworkType')" min-width="170">
					<template #default="scope">
						<el-tag effect="plain" type="info">
							{{ getOptionLabel(FRAMEWORK_TYPE_OPTIONS, scope.row.frameworkType) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.status')" min-width="120">
					<template #default="scope">
						<el-tag :type="getOptionTagType(AGENT_STATUS_OPTIONS, scope.row.status)">
							{{ getOptionLabel(AGENT_STATUS_OPTIONS, scope.row.status) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.visibilityScope')" min-width="140">
					<template #default="scope">
						<el-tag :type="getOptionTagType(VISIBILITY_SCOPE_OPTIONS, scope.row.visibilityScope)">
							{{ getOptionLabel(VISIBILITY_SCOPE_OPTIONS, scope.row.visibilityScope) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.healthStatus')" min-width="120">
					<template #default="scope">
						<el-tag :type="getOptionTagType(HEALTH_STATUS_OPTIONS, scope.row.healthStatus)">
							{{ getOptionLabel(HEALTH_STATUS_OPTIONS, scope.row.healthStatus) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.publishedAt')" min-width="220">
					<template #default="scope">
						<div class="agent-list__primary-cell">
							<span class="agent-list__primary-text">{{ formatDateTime(scope.row.publishedAt) }}</span>
							<span class="agent-list__secondary-text">{{ getReleaseSummary(scope.row) }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="t('agent.table.updatedAt')" prop="updatedAt" min-width="180">
					<template #default="scope">
						{{ formatDateTime(scope.row.updatedAt) }}
					</template>
				</el-table-column>
				<el-table-column :label="t('common.action')" fixed="right" min-width="240">
					<template #default="scope">
						<el-button text type="primary" @click="goDetail(scope.row.agentId)">
							{{ t('common.detailBtn') }}
						</el-button>
						<el-button v-auth="AGENT_PERMISSION_CODES.EDIT" text type="primary" @click="formRef?.openDialog(scope.row.agentId)">
							{{ t('common.editBtn') }}
						</el-button>
						<el-button v-auth="AGENT_PERMISSION_CODES.GRANT" text type="primary" @click="aclDrawerRef?.openDrawer(scope.row)">
							{{ t('agent.action.grant') }}
						</el-button>
						<el-button v-auth="AGENT_PERMISSION_CODES.DELETE" text type="primary" @click="handleDelete([scope.row.agentId])">
							{{ t('common.delBtn') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>

			<pagination v-bind="state.pagination" @current-change="currentChangeHandle" @size-change="sizeChangeHandle" />
		</div>

		<agent-form ref="formRef" @refresh="handleFormRefresh" />
		<acl-drawer ref="aclDrawerRef" />
	</div>
</template>

<script lang="ts" name="agentIndex" setup>
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { deleteAgent, pageAgents } from '/@/api/admin/agent';
import { getAgentCategoryTree } from '/@/api/admin/agent-category';
import { pageAgentTags } from '/@/api/admin/agent-tag';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { BasicTableProps, useTable } from '/@/hooks/table';
import type { AgentCategory, AgentItem, AgentOptionItem, AgentRelease, AgentStatus, AgentTag } from '/@/types/agent';
import {
	AGENT_PERMISSION_CODES,
	AGENT_STATUS_OPTIONS,
	FRAMEWORK_TYPE_OPTIONS,
	HEALTH_STATUS_OPTIONS,
	VISIBILITY_SCOPE_OPTIONS,
} from '/@/types/agent';

interface AgentListQueryForm {
	keyword: string;
	status: AgentStatus | '';
	frameworkType: string;
	categoryId: string;
	tagId: string;
	onlyMine: boolean;
	onlyAuthorized: boolean;
}

interface AgentFilterOption {
	label: string;
	value: string;
}

interface AgentListRow extends AgentItem {
	description?: string | null;
	currentRelease?: AgentRelease | null;
}

const AgentForm = defineAsyncComponent(() => import('./form.vue'));
const AclDrawer = defineAsyncComponent(() => import('./components/acl-drawer.vue'));

const router = useRouter();
const { t } = useI18n();

const queryRef = ref();
const formRef = ref();
const aclDrawerRef = ref();
const showSearch = ref(true);
const selectedAgentIds = ref<string[]>([]);
const multiple = ref(true);
const categoryOptions = ref<AgentFilterOption[]>([]);
const tagOptions = ref<AgentFilterOption[]>([]);

const createDefaultQueryForm = (): AgentListQueryForm => ({
	keyword: '',
	status: '',
	frameworkType: '',
	categoryId: '',
	tagId: '',
	onlyMine: false,
	onlyAuthorized: false,
});

const queryForm = reactive<AgentListQueryForm>(createDefaultQueryForm());

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm,
	pageList: pageAgents,
});

const { getDataList, currentChangeHandle, sizeChangeHandle, tableStyle } = useTable(state);

const formatDateTime = (value?: string | null) => {
	if (!value) {
		return '--';
	}
	return value.replace('T', ' ').replace('Z', '');
};

const getOptionLabel = (options: ReadonlyArray<AgentOptionItem<string>>, value?: string | null) => {
	const matchedOption = options.find((item) => item.value === value);
	if (matchedOption) {
		return t(matchedOption.labelKey);
	}
	return value || '--';
};

const getOptionTagType = (options: ReadonlyArray<AgentOptionItem<string>>, value?: string | null) => {
	return options.find((item) => item.value === value)?.tagType || 'info';
};

const getReleaseSummary = (row: AgentListRow) => {
	if (!row.currentRelease) {
		return t('agent.empty.noRelease');
	}

	return `#${row.currentRelease.releaseNo} · ${getOptionLabel(
		[
			{ value: 'PUBLISH', labelKey: 'agent.enums.releaseAction.publish' },
			{ value: 'OFFLINE', labelKey: 'agent.enums.releaseAction.offline' },
		],
		row.currentRelease.actionType
	)}`;
};

const buildCategoryOptions = (nodes: AgentCategory[], parents: string[] = []): AgentFilterOption[] => {
	return nodes.flatMap((node) => {
		const currentPath = [...parents, node.categoryName];
		return [{ value: node.categoryId, label: currentPath.join(' / ') }, ...buildCategoryOptions(node.children || [], currentPath)];
	});
};

const handleSelectionChange = (rows: AgentListRow[]) => {
	selectedAgentIds.value = rows.map((row) => row.agentId);
	multiple.value = !rows.length;
};

const resetQuery = () => {
	queryRef.value?.resetFields();
	Object.assign(queryForm, createDefaultQueryForm());
	getDataList();
};

const handleFormRefresh = () => {
	getDataList(false);
};

const goMetaPage = (tab: 'category' | 'tag') => {
	router.push({
		path: '/admin/agent-meta/index',
		query: { tab },
	});
};

const goDetail = (agentId: string) => {
	router.push({
		path: '/admin/agent/detail',
		query: { agentId },
	});
};

const handleDelete = async (agentIds: string[]) => {
	if (!agentIds.length) {
		return;
	}

	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		for (const agentId of agentIds) {
			await deleteAgent(agentId);
		}
		getDataList(false);
		useMessage().success(t('common.delSuccessText'));
	} catch (error: any) {
		useMessage().error(error.msg || t('common.delErrorText'));
	}
};

const loadCategoryOptions = async () => {
	try {
		const response = await getAgentCategoryTree();
		categoryOptions.value = buildCategoryOptions(response.data || []);
	} catch (error: any) {
		useMessage().error(error.msg || t('agent.message.loadCategoryFailed'));
	}
};

const loadTagOptions = async () => {
	try {
		const response = await pageAgentTags({ current: 1, size: 100 });
		const records = response.data?.records || [];
		tagOptions.value = records.map((item: AgentTag) => ({
			label: item.tagName,
			value: item.tagId,
		}));
	} catch (error: any) {
		useMessage().error(error.msg || t('agent.message.loadTagFailed'));
	}
};

onMounted(() => {
	loadCategoryOptions();
	loadTagOptions();
});
</script>

<style lang="scss" scoped>
.agent-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.agent-list__hero {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
}

.agent-list__hero-main {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.agent-list__title {
	margin: 0;
	font-size: 24px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.agent-list__subtitle {
	margin: 0;
	font-size: 14px;
	line-height: 1.6;
	color: var(--el-text-color-secondary);
}

.agent-list__hero-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 12px;
}

.agent-list__summary-alert {
	margin-bottom: 4px;
}

.agent-list__query {
	margin-left: 0;
}

.agent-list__toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
}

.agent-list__toolbar-right {
	margin-left: auto;
}

.agent-list__primary-cell {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 6px;
}

.agent-list__primary-text {
	font-size: 14px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.agent-list__secondary-text,
.agent-list__description {
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
	word-break: break-all;
}

.agent-list__tag-group {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

@media screen and (max-width: 768px) {
	.agent-list__hero,
	.agent-list__toolbar {
		flex-direction: column;
		align-items: stretch;
	}

	.agent-list__hero-actions {
		justify-content: flex-start;
	}

	.agent-list__toolbar-right {
		margin-left: 0;
	}
}
</style>
