<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view agent-detail">
			<div class="agent-detail__header">
				<div>
					<h2 class="agent-detail__title">{{ t('agent.detailTitle') }}</h2>
					<p class="agent-detail__subtitle">{{ t('agent.message.detailTodo') }}</p>
				</div>
				<el-button @click="router.back()">{{ t('common.backBtn') }}</el-button>
			</div>

			<el-card shadow="never">
				<el-descriptions :column="1" border>
					<el-descriptions-item :label="t('agent.field.agentId')">
						{{ String(route.query.agentId || '--') }}
					</el-descriptions-item>
				</el-descriptions>
			</el-card>
		</div>
	</div>
</template>

<script lang="ts" name="agentDetail" setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.agent-detail {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.agent-detail__header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
}

.agent-detail__title {
	margin: 0;
	font-size: 24px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.agent-detail__subtitle {
	margin: 8px 0 0;
	font-size: 14px;
	line-height: 1.6;
	color: var(--el-text-color-secondary);
}

@media screen and (max-width: 768px) {
	.agent-detail__header {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
