export declare class CreatePageVersionDto {
    pageId: string;
    name?: string;
    description?: string;
    schema: Record<string, any>;
    isPublished?: boolean;
    creatorId: string;
}
