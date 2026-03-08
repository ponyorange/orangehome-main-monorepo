import { PageVersionService } from './page-version.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
export declare class PageVersionController {
    private readonly pageVersionService;
    constructor(pageVersionService: PageVersionService);
    create(createPageVersionDto: CreatePageVersionDto): Promise<any>;
    findAll(pageId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    publish(id: string): Promise<any>;
    rollback(pageId: string, versionId: string): Promise<any>;
    remove(id: string): Promise<any>;
}
