import { IZendeskResponse } from "./zendesk-api";

export type HelpCenterState = "enabled" | "disabled" | "restricted";

export interface IBrandLogo {
    content_type?: string;
    content_url?: string;
    deleted?: boolean;
    file_name?: string;
    height?: string;
    id?: number;
    inline?: boolean;
    mapped_content_url?: string;
    size?: number;
    thumbnails?: {
        content_type: string;
        content_url: string;
        deleted: boolean;
        file_name: string;
        height: string;
        id: number;
        inline: boolean;
        mapped_content_url: string;
        size: number;
        url: string;
        width: string;
    }[];
    url?: string;
    width?: string;
}

export interface IZendeskBrand {
    active: boolean;
    brand_url: string;
    created_at: string;
    default: boolean;
    has_help_center: boolean;
    help_center_state: HelpCenterState;
    host_mapping: string;
    id: number;
    is_deleted: boolean;
    logo: IBrandLogo | null;
    name: string;
    signature_template: string;
    subdomain: string;
    ticket_form_ids: number[];
    updated_at: string;
    url: string;
}

export interface IBrandsResponse extends IZendeskResponse {
    brands: IZendeskBrand[];
}

export interface IBrandResponse extends IZendeskResponse {
    brand: IZendeskBrand;
}
