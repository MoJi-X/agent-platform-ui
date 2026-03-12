import request from '/@/utils/request';
import type { AgentApiResponse, AgentPageResult, AgentTag, AgentTagPageQuery, AgentTagPayload } from '/@/types/agent';

const AGENT_TAG_PREFIX = '/agent-console/console/agent-tags';

export const pageAgentTags = (params?: AgentTagPageQuery) => {
	return request({
		url: `${AGENT_TAG_PREFIX}/page`,
		method: 'get',
		params,
	}) as Promise<AgentApiResponse<AgentPageResult<AgentTag>>>;
};

export const createAgentTag = (data: AgentTagPayload) => {
	return request({
		url: AGENT_TAG_PREFIX,
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<string>>;
};

export const updateAgentTag = (tagId: string, data: AgentTagPayload) => {
	return request({
		url: `${AGENT_TAG_PREFIX}/${tagId}`,
		method: 'put',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const deleteAgentTag = (tagId: string) => {
	return request({
		url: `${AGENT_TAG_PREFIX}/${tagId}`,
		method: 'delete',
	}) as Promise<AgentApiResponse<boolean>>;
};
