<template>
	<el-drawer v-model="visible" :title="drawerTitle" destroy-on-close size="520px">
		<el-alert :closable="false" show-icon type="info" :title="t('agent.message.formTodo')" />

		<el-descriptions class="agent-form__meta" :column="1" border>
			<el-descriptions-item :label="t('agent.field.agentId')">
				{{ currentAgentId || '--' }}
			</el-descriptions-item>
		</el-descriptions>

		<template #footer>
			<div class="agent-form__footer">
				<el-button @click="visible = false">{{ t('common.cancelButtonText') }}</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script lang="ts" name="agentForm" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const visible = ref(false);
const currentAgentId = ref('');

const drawerTitle = computed(() => {
	return currentAgentId.value ? t('agent.action.edit') : t('agent.action.create');
});

const openDialog = (agentId = '') => {
	currentAgentId.value = agentId;
	visible.value = true;
};

defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.agent-form__meta {
	margin-top: 16px;
}

.agent-form__footer {
	display: flex;
	justify-content: flex-end;
}
</style>
