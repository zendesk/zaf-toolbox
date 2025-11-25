import { IZendeskResponse } from "./zendesk-api";

interface IViewCondition {
    field: string;
    operator: string;
    value: string | number | boolean;
}

export interface IViewConditions {
    all?: IViewCondition[];
    // eslint-disable-next-line id-denylist
    any?: IViewCondition[];
}

export interface IViewColumn {
    id: number | string;
    title: string;
    type: string;
    url?: string;
}

export interface IViewGroup {
    id: string;
    title: string;
    order: "asc" | "desc";
}

export interface IViewSort {
    id: string;
    title: string;
    order: "asc" | "desc";
}

export interface IViewExecution {
    group_by?: string;
    sort_by?: string;
    group_order?: "asc" | "desc";
    sort_order?: "asc" | "desc";
    columns: IViewColumn[];
    group: IViewGroup;
    sort: IViewSort;
}

export interface IViewRestriction {
    type: string;
    id: number;
}

export interface IZendeskView {
    active: boolean;
    conditions: IViewConditions;
    created_at: string;
    default: boolean;
    description: string;
    execution: IViewExecution;
    id: number;
    position: number;
    restriction: IViewRestriction | null;
    title: string;
    updated_at: string;
}

export interface IViewsResponse extends IZendeskResponse {
    views: IZendeskView[];
}
