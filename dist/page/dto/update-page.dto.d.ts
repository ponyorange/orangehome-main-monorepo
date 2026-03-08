import { CreatePageDto } from './create-page.dto';
declare const UpdatePageDto_base: import("@nestjs/common").Type<Partial<CreatePageDto>>;
export declare class UpdatePageDto extends UpdatePageDto_base {
    name?: string;
    schema?: Record<string, any>;
}
export {};
