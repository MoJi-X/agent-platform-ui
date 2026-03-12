<template>
	<el-drawer v-model="visible" :title="drawerTitle" destroy-on-close size="920px" @closed="handleClosed">
		<div v-loading="loading" class="agent-form">
			<div class="agent-form__hero">
				<div>
					<h3 class="agent-form__title">{{ drawerTitle }}</h3>
					<p class="agent-form__subtitle">{{ isEditMode ? t('agent.hint.defaultEndpointOnly') : t('agent.hint.createDraftStatus') }}</p>
				</div>
				<el-tag :type="statusTagType" effect="plain">{{ statusLabel }}</el-tag>
			</div>

			<el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
				<section class="agent-form__section">
					<h4>{{ t('agent.section.basicInfo') }}</h4>
					<el-row :gutter="16">
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.agentCode')" prop="agentCode"
								><el-input
									v-model="form.agentCode"
									:disabled="isEditMode"
									:maxlength="64"
									:placeholder="t('agent.placeholder.agentCode')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.agentName')" prop="agentName"
								><el-input
									v-model="form.agentName"
									:maxlength="AGENT_VALIDATION.maxNameLength"
									:placeholder="t('agent.placeholder.agentName')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.frameworkType')" prop="frameworkType"
								><el-select v-model="form.frameworkType" class="w100" :placeholder="t('agent.placeholder.frameworkType')"
									><el-option
										v-for="item in FRAMEWORK_TYPE_OPTIONS"
										:key="item.value"
										:label="t(item.labelKey)"
										:value="item.value" /></el-select></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.visibilityScope')" prop="visibilityScope"
								><el-select v-model="form.visibilityScope" class="w100" :placeholder="t('agent.placeholder.visibilityScope')"
									><el-option
										v-for="item in VISIBILITY_SCOPE_OPTIONS"
										:key="item.value"
										:label="t(item.labelKey)"
										:value="item.value" /></el-select></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.categoryId')"
								><el-tree-select
									v-model="form.categoryId"
									:data="categoryTree"
									:props="categoryTreeProps"
									check-strictly
									clearable
									class="w100"
									filterable
									:placeholder="t('agent.placeholder.categoryId')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.tagIds')" prop="tagIds"
								><el-select
									v-model="form.tagIds"
									class="w100"
									clearable
									collapse-tags
									collapse-tags-tooltip
									filterable
									multiple
									:placeholder="t('agent.placeholder.tagIds')"
									><el-option v-for="item in tagOptions" :key="item.tagId" :label="item.tagName" :value="item.tagId" /></el-select></el-form-item
						></el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.description')" prop="description"
								><el-input
									v-model="form.description"
									:autosize="{ minRows: 3, maxRows: 5 }"
									:maxlength="AGENT_VALIDATION.maxDescriptionLength"
									show-word-limit
									type="textarea"
									:placeholder="t('agent.placeholder.description')" /></el-form-item
						></el-col>
					</el-row>
				</section>

				<section class="agent-form__section">
					<h4>{{ t('agent.section.schema') }}</h4>
					<el-row :gutter="16">
						<el-col :md="8" :xs="24"
							><el-form-item :label="t('agent.field.schemaSpecVersion')"
								><el-select v-model="form.schemaSpecVersion" class="w100"
									><el-option :label="AGENT_DEFAULT_SCHEMA_SPEC_VERSION" :value="AGENT_DEFAULT_SCHEMA_SPEC_VERSION" /></el-select></el-form-item
						></el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.frameworkConfig')" prop="frameworkConfigText"
								><el-input
									v-model="form.frameworkConfigText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="t('agent.placeholder.frameworkConfig')" /></el-form-item
						></el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.inputSchema')" prop="inputSchemaText"
								><el-input
									v-model="form.inputSchemaText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="t('agent.placeholder.inputSchema')" /></el-form-item
						></el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.outputSchema')" prop="outputSchemaText"
								><el-input
									v-model="form.outputSchemaText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="t('agent.placeholder.outputSchema')" /></el-form-item
						></el-col>
					</el-row>
				</section>

				<section class="agent-form__section">
					<div class="agent-form__section-head">
						<h4>{{ t('agent.section.defaultEndpoint') }}</h4>
						<p>{{ t('agent.hint.defaultEndpointOnly') }}</p>
					</div>
					<el-row :gutter="16">
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.endpointName')" prop="endpointName"
								><el-input
									v-model="form.endpointName"
									:maxlength="AGENT_VALIDATION.maxNameLength"
									:placeholder="t('agent.placeholder.endpointName')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.protocol')" prop="protocol"
								><el-select v-model="form.protocol" class="w100" :placeholder="t('agent.placeholder.protocol')"
									><el-option
										v-for="item in ENDPOINT_PROTOCOL_OPTIONS"
										:key="item.value"
										:label="t(item.labelKey)"
										:value="item.value" /></el-select></el-form-item
						></el-col>
						<el-col :md="8" :xs="24"
							><el-form-item :label="t('agent.field.streamMode')"><el-switch v-model="form.streamMode" /></el-form-item
						></el-col>
						<el-col :md="8" :xs="24"
							><el-form-item :label="t('agent.field.enabled')"><el-switch v-model="form.enabled" /></el-form-item
						></el-col>
						<el-col :md="8" :xs="24"
							><el-form-item :label="t('agent.field.isDefault')"><el-switch v-model="form.isDefault" disabled /></el-form-item
						></el-col>
						<el-col :md="8" :xs="24"
							><el-form-item :label="t('agent.field.timeoutMs')" prop="timeoutMs"
								><el-input-number
									v-model="form.timeoutMs"
									class="w100"
									:max="AGENT_VALIDATION.maxTimeoutMs"
									:min="AGENT_VALIDATION.minTimeoutMs"
									:step="1000" /></el-form-item
						></el-col>
						<el-col :md="16" :xs="24"
							><el-form-item :label="t('agent.field.baseUrl')" prop="baseUrl"
								><el-input v-model="form.baseUrl" :maxlength="512" :placeholder="t('agent.placeholder.baseUrl')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.invokePath')" prop="invokePath"
								><el-input v-model="form.invokePath" :maxlength="256" :placeholder="t('agent.placeholder.invokePath')" /></el-form-item
						></el-col>
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.healthcheckUrl')" prop="healthcheckUrl"
								><el-input v-model="form.healthcheckUrl" :maxlength="512" :placeholder="t('agent.placeholder.healthcheckUrl')" /></el-form-item
						></el-col>
					</el-row>
				</section>

				<section class="agent-form__section">
					<div class="agent-form__section-head">
						<h4>{{ t('agent.section.authAndMapping') }}</h4>
						<p>{{ t('agent.hint.sensitiveHeaders') }}</p>
					</div>
					<el-row :gutter="16">
						<el-col :md="12" :xs="24"
							><el-form-item :label="t('agent.field.authType')"
								><el-select v-model="form.authType" class="w100" :placeholder="t('agent.placeholder.authType')"
									><el-option
										v-for="item in AUTH_TYPE_OPTIONS"
										:key="item.value"
										:label="t(item.labelKey)"
										:value="item.value" /></el-select></el-form-item
						></el-col>
						<el-col v-if="showCredentialFields" :span="24"><el-alert :closable="false" show-icon type="info" :title="authRequirementText" /></el-col>
						<el-col v-if="showCredentialFields" :span="24"
							><el-form-item :label="t('agent.field.authConfig')" prop="authConfigText"
								><el-input
									v-model="form.authConfigText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="authConfigPlaceholder" /></el-form-item
						></el-col>
						<el-col v-if="showCredentialFields && canReuseCredential" :md="12" :xs="24"
							><el-form-item :label="t('agent.field.authCredentialId')"><el-input v-model="form.authCredentialId" readonly /></el-form-item
						></el-col>
						<el-col v-if="showCredentialFields && canReuseCredential && form.secretPayloadMaskText" :span="24"
							><el-form-item :label="t('agent.field.maskedCredential')"
								><el-input v-model="form.secretPayloadMaskText" readonly type="textarea" :autosize="{ minRows: 4, maxRows: 10 }" /></el-form-item
						></el-col>
						<el-col v-if="showCredentialFields" :span="24">
							<el-form-item :label="t('agent.field.credential')" prop="secretPayloadText">
								<el-input
									v-model="form.secretPayloadText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="secretPayloadPlaceholder"
								/>
								<p v-if="canReuseCredential" class="agent-form__help">{{ t('agent.hint.keepCredential') }}</p>
							</el-form-item>
						</el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.headersJson')" prop="headersJsonText"
								><el-input
									v-model="form.headersJsonText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="t('agent.placeholder.headersJson')" /></el-form-item
						></el-col>
						<el-col :span="24"
							><el-form-item :label="t('agent.field.mappingJson')" prop="mappingJsonText"
								><el-input
									v-model="form.mappingJsonText"
									:autosize="{ minRows: 4, maxRows: 10 }"
									type="textarea"
									:placeholder="t('agent.placeholder.mappingJson')" /></el-form-item
						></el-col>
					</el-row>
				</section>
			</el-form>
		</div>

		<template #footer>
			<div class="agent-form__footer">
				<el-button @click="visible = false">{{ t('common.cancelButtonText') }}</el-button>
				<el-button :disabled="submitting" @click="handleSubmit(false)">{{ t('agent.action.saveDraft') }}</el-button>
				<el-button :disabled="submitting" type="primary" @click="handleSubmit(true)">{{ t('agent.action.saveAndPublish') }}</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script lang="ts" name="agentForm" setup>
import { computed, nextTick, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { createAgent, getAgentDetail, updateAgent } from '/@/api/admin/agent';
import { getAgentCategoryTree } from '/@/api/admin/agent-category';
import { pageAgentTags } from '/@/api/admin/agent-tag';
import { useMessage } from '/@/hooks/message';
import type {
	AgentAuthType,
	AgentCategory,
	AgentDetail,
	AgentEndpoint,
	AgentEndpointAuthPayload,
	AgentEndpointPayload,
	AgentEndpointProtocol,
	AgentFrameworkType,
	AgentRegisterPayload,
	AgentSchemaSpecVersion,
	AgentStatus,
	AgentTag,
	AgentUpdatePayload,
	AgentVisibilityScope,
	JsonObject,
} from '/@/types/agent';
import {
	AGENT_DEFAULT_SCHEMA_SPEC_VERSION,
	AGENT_STATUS_OPTIONS,
	AGENT_VALIDATION,
	AUTH_TYPE_OPTIONS,
	ENDPOINT_PROTOCOL_OPTIONS,
	FRAMEWORK_TYPE_OPTIONS,
	VISIBILITY_SCOPE_OPTIONS,
} from '/@/types/agent';

interface AgentFormModel {
	agentCode: string;
	agentName: string;
	description: string;
	frameworkType: AgentFrameworkType;
	visibilityScope: AgentVisibilityScope;
	categoryId: string;
	tagIds: string[];
	schemaSpecVersion: AgentSchemaSpecVersion;
	frameworkConfigText: string;
	inputSchemaText: string;
	outputSchemaText: string;
	endpointId: string;
	endpointName: string;
	protocol: AgentEndpointProtocol;
	streamMode: boolean;
	baseUrl: string;
	invokePath: string;
	healthcheckUrl: string;
	timeoutMs: number;
	enabled: boolean;
	isDefault: boolean;
	authType: AgentAuthType;
	authConfigText: string;
	authCredentialId: string;
	secretPayloadText: string;
	secretPayloadMaskText: string;
	headersJsonText: string;
	mappingJsonText: string;
}

const EMPTY_JSON = '{}';
const SENSITIVE_HEADERS = ['authorization', 'proxy-authorization', 'x-api-key', 'api-key', 'x-auth-token', 'cookie', 'set-cookie'];
const categoryTreeProps = { value: 'categoryId', label: 'categoryName', children: 'children' };
const authConfigPlaceholders: Record<AgentAuthType, string> = {
	NONE: '',
	API_KEY: '{\n  "transport": "HEADER",\n  "parameterName": "X-API-Key"\n}',
	BEARER_TOKEN: '{\n  "headerName": "Authorization",\n  "prefix": "Bearer "\n}',
	BASIC: '{}',
	OAUTH2_CLIENT_CREDENTIALS: '{\n  "tokenUrl": "https://example.com/oauth/token",\n  "clientId": "agent-console"\n}',
	CUSTOM_HEADER: '{\n  "headerName": "X-Custom-Token"\n}',
};
const secretPayloadPlaceholders: Record<AgentAuthType, string> = {
	NONE: '',
	API_KEY: '{\n  "apiKey": "sk-demo"\n}',
	BEARER_TOKEN: '{\n  "accessToken": "token-demo"\n}',
	BASIC: '{\n  "username": "demo",\n  "password": "secret"\n}',
	OAUTH2_CLIENT_CREDENTIALS: '{\n  "clientSecret": "client-secret"\n}',
	CUSTOM_HEADER: '{\n  "headerValue": "header-secret"\n}',
};

const emit = defineEmits<{ refresh: [] }>();
const router = useRouter();
const { t } = useI18n();
const message = useMessage();

const formRef = ref<FormInstance>();
const visible = ref(false);
const loading = ref(false);
const submitting = ref(false);
const currentAgentId = ref('');
const currentStatus = ref<AgentStatus>('DRAFT');
const originalEndpoint = ref<AgentEndpoint | null>(null);
const categoryTree = ref<AgentCategory[]>([]);
const tagOptions = ref<AgentTag[]>([]);

const createDefaultForm = (): AgentFormModel => ({
	agentCode: '',
	agentName: '',
	description: '',
	frameworkType: 'OPENAI_COMPAT',
	visibilityScope: 'PRIVATE',
	categoryId: '',
	tagIds: [],
	schemaSpecVersion: AGENT_DEFAULT_SCHEMA_SPEC_VERSION,
	frameworkConfigText: EMPTY_JSON,
	inputSchemaText: EMPTY_JSON,
	outputSchemaText: EMPTY_JSON,
	endpointId: '',
	endpointName: '',
	protocol: 'HTTP',
	streamMode: false,
	baseUrl: '',
	invokePath: '/',
	healthcheckUrl: '',
	timeoutMs: 60000,
	enabled: true,
	isDefault: true,
	authType: 'NONE',
	authConfigText: EMPTY_JSON,
	authCredentialId: '',
	secretPayloadText: '',
	secretPayloadMaskText: '',
	headersJsonText: EMPTY_JSON,
	mappingJsonText: EMPTY_JSON,
});

const form = reactive<AgentFormModel>(createDefaultForm());
const isEditMode = computed(() => Boolean(currentAgentId.value));
const showCredentialFields = computed(() => form.authType !== 'NONE');
const authTypeChanged = computed(() => form.authType !== (originalEndpoint.value?.authType || 'NONE'));
const canReuseCredential = computed(() => isEditMode.value && Boolean(form.authCredentialId) && !authTypeChanged.value);
const drawerTitle = computed(() => (isEditMode.value ? t('agent.action.edit') : t('agent.action.create')));
const statusLabel = computed(() => getOptionLabel(AGENT_STATUS_OPTIONS, currentStatus.value));
const statusTagType = computed(() => AGENT_STATUS_OPTIONS.find((item) => item.value === currentStatus.value)?.tagType || 'info');
const authConfigPlaceholder = computed(() => authConfigPlaceholders[form.authType] || EMPTY_JSON);
const secretPayloadPlaceholder = computed(() => secretPayloadPlaceholders[form.authType] || EMPTY_JSON);
const authRequirementText = computed(() =>
	t('agent.hint.authRequirement', {
		authType: getOptionLabel(AUTH_TYPE_OPTIONS, form.authType),
		config: getAuthConfigRequirement(form.authType),
		secret: getSecretRequirement(form.authType),
	})
);

const isPlainObject = (value: unknown): value is JsonObject => Object.prototype.toString.call(value) === '[object Object]';
const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const isHttpUrl = (value: string) => {
	try {
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol);
	} catch {
		return false;
	}
};
const getOptionLabel = (options: ReadonlyArray<{ value: string; labelKey: string }>, value?: string | null) => {
	const matched = options.find((item) => item.value === value);
	return matched ? t(matched.labelKey) : value || '--';
};
const formatJson = (value: JsonObject | null | undefined, emptyValue = EMPTY_JSON) =>
	!value || !Object.keys(value).length ? emptyValue : JSON.stringify(value, null, 2);
const parseJsonObject = (text: string, emptyValue: JsonObject = {}) => {
	const normalized = text.trim();
	if (!normalized) return emptyValue;
	const parsed = JSON.parse(normalized);
	if (!isPlainObject(parsed)) throw new Error('invalid_json');
	return parsed;
};
const getAuthConfigRequirement = (authType: AgentAuthType) => {
	if (authType === 'API_KEY') return 'transport, parameterName';
	if (authType === 'OAUTH2_CLIENT_CREDENTIALS') return 'tokenUrl, clientId';
	return authType === 'NONE' ? '--' : '{}';
};
const getSecretRequirement = (authType: AgentAuthType) => {
	if (authType === 'API_KEY') return 'apiKey';
	if (authType === 'BEARER_TOKEN') return 'accessToken | bearerToken | token';
	if (authType === 'BASIC') return 'username, password';
	if (authType === 'OAUTH2_CLIENT_CREDENTIALS') return 'clientSecret';
	if (authType === 'CUSTOM_HEADER') return 'headerValue';
	return '--';
};
const getMissingAuthConfigKeys = (authType: AgentAuthType, config: JsonObject) => {
	if (authType === 'API_KEY')
		return [
			config.transport === 'HEADER' || config.transport === 'QUERY' ? '' : 'transport',
			isNonEmptyString(config.parameterName) ? '' : 'parameterName',
		].filter(Boolean);
	if (authType === 'OAUTH2_CLIENT_CREDENTIALS')
		return [
			isNonEmptyString(config.tokenUrl) && isHttpUrl(String(config.tokenUrl)) ? '' : 'tokenUrl',
			isNonEmptyString(config.clientId) ? '' : 'clientId',
		].filter(Boolean);
	return [];
};
const getMissingSecretKeys = (authType: AgentAuthType, payload: JsonObject) => {
	if (authType === 'API_KEY') return isNonEmptyString(payload.apiKey) ? [] : ['apiKey'];
	if (authType === 'BEARER_TOKEN')
		return ['accessToken', 'bearerToken', 'token'].some((key) => isNonEmptyString(payload[key])) ? [] : ['accessToken | bearerToken | token'];
	if (authType === 'BASIC')
		return [isNonEmptyString(payload.username) ? '' : 'username', isNonEmptyString(payload.password) ? '' : 'password'].filter(Boolean);
	if (authType === 'OAUTH2_CLIENT_CREDENTIALS') return isNonEmptyString(payload.clientSecret) ? [] : ['clientSecret'];
	if (authType === 'CUSTOM_HEADER') return isNonEmptyString(payload.headerValue) ? [] : ['headerValue'];
	return [];
};
const validateJsonSection = (value: string, label: string) => {
	try {
		parseJsonObject(value);
		return '';
	} catch {
		return t('agent.validation.jsonSectionInvalid', { section: label });
	}
};
const validateJsonField = (labelKey: string) => (_rule: unknown, value: string, callback: (error?: Error) => void) => {
	const error = validateJsonSection(value, t(labelKey));
	callback(error ? new Error(error) : undefined);
};

const formRules = reactive<FormRules<AgentFormModel>>({
	agentCode: [
		{
			validator: (_r, value: string, cb) =>
				cb(
					!value.trim()
						? new Error(t('agent.validation.agentCodeRequired'))
						: !AGENT_VALIDATION.codePattern.test(value.trim())
							? new Error(t('agent.validation.agentCodeInvalid'))
							: undefined
				),
			trigger: 'blur',
		},
	],
	agentName: [
		{
			validator: (_r, value: string, cb) =>
				cb(
					!value.trim()
						? new Error(t('agent.validation.agentNameRequired'))
						: value.trim().length > AGENT_VALIDATION.maxNameLength
							? new Error(t('agent.validation.agentNameTooLong'))
							: undefined
				),
			trigger: 'blur',
		},
	],
	description: [
		{
			validator: (_r, value: string, cb) =>
				cb(value.length > AGENT_VALIDATION.maxDescriptionLength ? new Error(t('agent.validation.descriptionTooLong')) : undefined),
			trigger: 'blur',
		},
	],
	frameworkType: [{ required: true, message: t('agent.validation.frameworkTypeRequired'), trigger: 'change' }],
	visibilityScope: [{ required: true, message: t('agent.validation.visibilityScopeRequired'), trigger: 'change' }],
	tagIds: [
		{
			validator: (_r, value: string[], cb) =>
				cb((value || []).length > AGENT_VALIDATION.maxTagCount ? new Error(t('agent.validation.tagIdsTooMany')) : undefined),
			trigger: 'change',
		},
	],
	frameworkConfigText: [{ validator: validateJsonField('agent.field.frameworkConfig'), trigger: 'blur' }],
	inputSchemaText: [{ validator: validateJsonField('agent.field.inputSchema'), trigger: 'blur' }],
	outputSchemaText: [{ validator: validateJsonField('agent.field.outputSchema'), trigger: 'blur' }],
	endpointName: [
		{
			validator: (_r, value: string, cb) =>
				cb(value.trim().length > AGENT_VALIDATION.maxNameLength ? new Error(t('agent.validation.endpointNameTooLong')) : undefined),
			trigger: 'blur',
		},
	],
	protocol: [{ validator: (_r, value: string, cb) => cb(!value ? new Error(t('agent.validation.protocolRequired')) : undefined), trigger: 'change' }],
	timeoutMs: [
		{
			validator: (_r, value: number, cb) =>
				cb(
					!Number.isFinite(value) || value < AGENT_VALIDATION.minTimeoutMs || value > AGENT_VALIDATION.maxTimeoutMs
						? new Error(t('agent.validation.timeoutMsInvalid'))
						: undefined
				),
			trigger: 'change',
		},
	],
	baseUrl: [
		{
			validator: (_r, value: string, cb) =>
				cb(
					!value.trim()
						? new Error(t('agent.validation.baseUrlRequired'))
						: !isHttpUrl(value.trim())
							? new Error(t('agent.validation.baseUrlInvalid'))
							: undefined
				),
			trigger: 'blur',
		},
	],
	invokePath: [
		{
			validator: (_r, value: string, cb) =>
				cb(
					!value.trim()
						? new Error(t('agent.validation.invokePathRequired'))
						: !AGENT_VALIDATION.pathPattern.test(value.trim())
							? new Error(t('agent.validation.invokePathInvalid'))
							: undefined
				),
			trigger: 'blur',
		},
	],
	healthcheckUrl: [
		{
			validator: (_r, value: string, cb) =>
				cb(value.trim() && !isHttpUrl(value.trim()) ? new Error(t('agent.validation.healthcheckUrlInvalid')) : undefined),
			trigger: 'blur',
		},
	],
	authConfigText: [
		{
			validator: (_r, value: string, cb) => {
				if (form.authType === 'NONE') return cb();
				const error = validateJsonSection(value, t('agent.field.authConfig'));
				if (error) return cb(new Error(error));
				try {
					const missing = getMissingAuthConfigKeys(form.authType, parseJsonObject(value));
					cb(
						missing.length
							? new Error(
									t('agent.validation.authConfigMissingKeys', {
										authType: getOptionLabel(AUTH_TYPE_OPTIONS, form.authType),
										keys: missing.join(', '),
									})
								)
							: undefined
					);
				} catch {
					cb(new Error(t('agent.validation.jsonSectionInvalid', { section: t('agent.field.authConfig') })));
				}
			},
			trigger: 'blur',
		},
	],
	secretPayloadText: [
		{
			validator: (_r, value: string, cb) => {
				if (form.authType === 'NONE') return cb();
				if (!value.trim())
					return cb(
						canReuseCredential.value
							? undefined
							: new Error(authTypeChanged.value ? t('agent.validation.secretPayloadRetypeRequired') : t('agent.validation.secretPayloadRequired'))
					);
				const error = validateJsonSection(value, t('agent.field.credential'));
				if (error) return cb(new Error(error));
				try {
					const missing = getMissingSecretKeys(form.authType, parseJsonObject(value));
					cb(
						missing.length
							? new Error(
									t('agent.validation.secretPayloadMissingKeys', {
										authType: getOptionLabel(AUTH_TYPE_OPTIONS, form.authType),
										keys: missing.join(', '),
									})
								)
							: undefined
					);
				} catch {
					cb(new Error(t('agent.validation.jsonSectionInvalid', { section: t('agent.field.credential') })));
				}
			},
			trigger: 'blur',
		},
	],
	headersJsonText: [
		{
			validator: (_r, value: string, cb) => {
				const error = validateJsonSection(value, t('agent.field.headersJson'));
				if (error) return cb(new Error(error));
				try {
					const sensitive = Object.keys(parseJsonObject(value))
						.map((key) => key.toLowerCase())
						.filter((key) => SENSITIVE_HEADERS.includes(key));
					cb(sensitive.length ? new Error(t('agent.validation.headersSensitive', { keys: Array.from(new Set(sensitive)).join(', ') })) : undefined);
				} catch {
					cb(new Error(t('agent.validation.jsonSectionInvalid', { section: t('agent.field.headersJson') })));
				}
			},
			trigger: 'blur',
		},
	],
	mappingJsonText: [{ validator: validateJsonField('agent.field.mappingJson'), trigger: 'blur' }],
});

const resetForm = () => {
	currentAgentId.value = '';
	currentStatus.value = 'DRAFT';
	originalEndpoint.value = null;
	Object.assign(form, createDefaultForm());
};
const handleClosed = () => {
	submitting.value = false;
	loading.value = false;
	resetForm();
	formRef.value?.clearValidate();
};
const resolveDefaultEndpoint = (detail: AgentDetail) =>
	detail.endpoints.find((item) => item.endpointId === detail.defaultEndpointId) ||
	detail.endpoints.find((item) => item.isDefault) ||
	detail.endpoints[0] ||
	null;
const hydrateFromDetail = (detail: AgentDetail) => {
	const endpoint = resolveDefaultEndpoint(detail);
	originalEndpoint.value = endpoint;
	currentStatus.value = detail.status;
	Object.assign(form, {
		agentCode: detail.agentCode || '',
		agentName: detail.agentName || '',
		description: detail.description || '',
		frameworkType: detail.frameworkType || 'OPENAI_COMPAT',
		visibilityScope: detail.visibilityScope || 'PRIVATE',
		categoryId: detail.categoryId || detail.category?.categoryId || '',
		tagIds: detail.tags?.map((item) => item.tagId) || [],
		schemaSpecVersion: detail.schemaSpecVersion || AGENT_DEFAULT_SCHEMA_SPEC_VERSION,
		frameworkConfigText: formatJson(detail.frameworkConfig),
		inputSchemaText: formatJson(detail.inputSchema),
		outputSchemaText: formatJson(detail.outputSchema),
		endpointId: endpoint?.endpointId || '',
		endpointName: endpoint?.endpointName || '',
		protocol: endpoint?.protocol || 'HTTP',
		streamMode: endpoint?.streamMode ?? false,
		baseUrl: endpoint?.baseUrl || '',
		invokePath: endpoint?.invokePath || '/',
		healthcheckUrl: endpoint?.healthcheckUrl || '',
		timeoutMs: endpoint?.timeoutMs || 60000,
		enabled: endpoint?.enabled ?? true,
		isDefault: true,
		authType: endpoint?.authType || 'NONE',
		authConfigText: formatJson(endpoint?.authConfig),
		authCredentialId: endpoint?.authCredentialId || '',
		secretPayloadText: '',
		secretPayloadMaskText: formatJson(endpoint?.secretPayloadMask, ''),
		headersJsonText: formatJson(endpoint?.headersJson),
		mappingJsonText: formatJson(endpoint?.mappingJson),
	});
};
const loadOptions = async () => {
	const [categoryResult, tagResult] = await Promise.allSettled([getAgentCategoryTree(), pageAgentTags({ current: 1, size: 100 })]);
	if (categoryResult.status === 'fulfilled') categoryTree.value = categoryResult.value.data || [];
	else message.error(categoryResult.reason?.msg || t('agent.message.loadCategoryFailed'));
	if (tagResult.status === 'fulfilled') tagOptions.value = tagResult.value.data?.records || [];
	else message.error(tagResult.reason?.msg || t('agent.message.loadTagFailed'));
};
const loadDetail = async (agentId: string) => {
	try {
		const response = await getAgentDetail(agentId);
		if (!response.data) throw new Error('empty_detail');
		hydrateFromDetail(response.data);
	} catch (error: any) {
		message.error(error.msg || t('agent.message.loadDetailFailed'));
		visible.value = false;
	}
};
const buildAuthPayload = (): AgentEndpointAuthPayload => {
	if (form.authType === 'NONE') return { authType: 'NONE', authConfig: {} };
	const payload: AgentEndpointAuthPayload = { authType: form.authType, authConfig: parseJsonObject(form.authConfigText) };
	if (form.secretPayloadText.trim()) payload.credential = { credentialMode: 'INLINE', secretPayload: parseJsonObject(form.secretPayloadText) };
	else if (canReuseCredential.value) payload.authCredentialId = form.authCredentialId;
	return payload;
};
const buildEndpointPayload = (): AgentEndpointPayload => ({
	endpointId: form.endpointId || undefined,
	endpointName: form.endpointName.trim() || undefined,
	protocol: form.protocol,
	streamMode: form.streamMode,
	baseUrl: form.baseUrl.trim(),
	invokePath: form.invokePath.trim(),
	healthcheckUrl: form.healthcheckUrl.trim() || undefined,
	timeoutMs: Number(form.timeoutMs),
	auth: buildAuthPayload(),
	headersJson: parseJsonObject(form.headersJsonText),
	mappingJson: parseJsonObject(form.mappingJsonText),
	enabled: form.enabled,
	isDefault: true,
});
const buildCreatePayload = (): AgentRegisterPayload => ({
	agentCode: form.agentCode.trim(),
	agentName: form.agentName.trim(),
	description: form.description.trim(),
	frameworkType: form.frameworkType,
	frameworkConfig: parseJsonObject(form.frameworkConfigText),
	schemaSpecVersion: form.schemaSpecVersion,
	inputSchema: parseJsonObject(form.inputSchemaText),
	outputSchema: parseJsonObject(form.outputSchemaText),
	visibilityScope: form.visibilityScope,
	categoryId: form.categoryId || undefined,
	tagIds: Array.from(new Set(form.tagIds)),
	endpoint: buildEndpointPayload(),
});
const buildUpdatePayload = (): AgentUpdatePayload => ({
	agentName: form.agentName.trim(),
	description: form.description.trim(),
	frameworkType: form.frameworkType,
	frameworkConfig: parseJsonObject(form.frameworkConfigText),
	schemaSpecVersion: form.schemaSpecVersion,
	inputSchema: parseJsonObject(form.inputSchemaText),
	outputSchema: parseJsonObject(form.outputSchemaText),
	visibilityScope: form.visibilityScope,
	categoryId: form.categoryId || undefined,
	tagIds: Array.from(new Set(form.tagIds)),
	defaultEndpointId: form.endpointId || undefined,
	endpoint: buildEndpointPayload(),
});
const handleSubmit = async (redirectToPublish: boolean) => {
	const valid = await formRef.value?.validate().catch(() => false);
	if (!valid) return;
	try {
		submitting.value = true;
		const response = isEditMode.value ? await updateAgent(currentAgentId.value, buildUpdatePayload()) : await createAgent(buildCreatePayload());
		const agentId = isEditMode.value ? currentAgentId.value : response.data?.agentId || '';
		message.success(t(isEditMode.value ? 'agent.message.updateSuccess' : 'agent.message.createSuccess'));
		visible.value = false;
		emit('refresh');
		if (redirectToPublish && agentId) router.push({ path: '/admin/agent/detail', query: { agentId, openPublish: '1' } });
	} catch (error: any) {
		message.error(error.msg || t('common.optErrorText'));
	} finally {
		submitting.value = false;
	}
};
const openDialog = async (agentId = '') => {
	visible.value = true;
	loading.value = true;
	resetForm();
	currentAgentId.value = agentId;
	await nextTick();
	formRef.value?.clearValidate();
	try {
		await loadOptions();
		if (agentId) await loadDetail(agentId);
	} finally {
		loading.value = false;
	}
};

defineExpose({ openDialog });
</script>

<style lang="scss" scoped>
.agent-form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.agent-form__hero,
.agent-form__footer {
	display: flex;
	justify-content: space-between;
	gap: 16px;
}
.agent-form__hero {
	align-items: flex-start;
}
.agent-form__title,
.agent-form__section h4 {
	margin: 0;
}
.agent-form__title {
	font-size: 18px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}
.agent-form__subtitle,
.agent-form__section-head p,
.agent-form__help {
	margin: 6px 0 0;
	font-size: 13px;
	line-height: 1.6;
	color: var(--el-text-color-secondary);
}
.agent-form__section {
	padding: 20px;
	border: 1px solid var(--el-border-color-light);
	border-radius: 12px;
	background: var(--el-bg-color-page);
}
.agent-form__section + .agent-form__section {
	margin-top: 16px;
}
.agent-form__section-head {
	margin-bottom: 16px;
}
.agent-form__footer {
	justify-content: flex-end;
}
@media screen and (max-width: 768px) {
	.agent-form__hero,
	.agent-form__footer {
		flex-direction: column;
	}
	.agent-form__section {
		padding: 16px;
	}
}
</style>
