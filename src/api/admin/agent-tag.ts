import request from '/@/utils/request';
import type { AgentApiResponse, AgentPageResult, AgentTag, AgentTagPageQuery, AgentTagPayload } from '/@/types/agent';

export const pageAgentTags = (params?: AgentTagPageQuery) => {
	return request({
		url: '/console/agent-tags/page',
		method: 'get',
		params,
	}) as Promise<AgentApiResponse<AgentPageResult<AgentTag>>>;
};

export const createAgentTag = (data: AgentTagPayload) => {
	return request({
		url: '/console/agent-tags',
		method: 'post',
		data,
	}) as Promise<AgentApiResponse<string>>;
};

export const updateAgentTag = (tagId: string, data: AgentTagPayload) => {
	return request({
		url: `/console/agent-tags/${tagId}`,
		method: 'put',
		data,
	}) as Promise<AgentApiResponse<boolean>>;
};

export const deleteAgentTag = (tagId: string) => {
	return request({
		url: `/console/agent-tags/${tagId}`,
		method: 'delete',
	}) as Promise<AgentApiResponse<boolean>>;
};
