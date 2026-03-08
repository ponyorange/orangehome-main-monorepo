import { CoreService } from '../core-service/core-service.service';
import { CreatePageVersionDto } from './dto/create-page-version.dto';
export declare class PageVersionService {
    private coreService;
    constructor(coreService: CoreService);
    create(createPageVersionDto: CreatePageVersionDto): Promise<any>;
    findAll(pageId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    publish(id: string): Promise<any>;
    rollback(pageId: string, versionId: string): Promise<any>;
    remove(id: string): Promise<any>;
}
