<template>
	<el-drawer v-model="visible" :title="t('agent.action.grant')" destroy-on-close size="560px">
		<el-alert :closable="false" show-icon type="info" :title="t('agent.message.aclTodo')" />

		<el-descriptions class="agent-acl__meta" :column="1" border>
			<el-descriptions-item :label="t('agent.field.agentId')">
				{{ currentAgent.agentId || '--' }}
			</el-descriptions-item>
			<el-descriptions-item :label="t('agent.field.agentName')">
				{{ currentAgent.agentName || '--' }}
			</el-descriptions-item>
			<el-descriptions-item :label="t('agent.field.agentCode')">
				{{ currentAgent.agentCode || '--' }}
			</el-descriptions-item>
		</el-descriptions>

		<template #footer>
			<div class="agent-acl__footer">
				<el-button @click="visible = false">{{ t('common.cancelButtonText') }}</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script lang="ts" name="agentAclDrawer" setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AgentItem } from '/@/types/agent';

const { t } = useI18n();

const visible = ref(false);
const currentAgent = reactive<Partial<AgentItem>>({});

const openDrawer = (agent: AgentItem) => {
	Object.assign(currentAgent, agent);
	visible.value = true;
};

defineExpose({
	openDrawer,
});
</script>

<style lang="scss" scoped>
.agent-acl__meta {
	margin-top: 16px;
}

.agent-acl__footer {
	display: flex;
	justify-content: flex-end;
}
</style>
