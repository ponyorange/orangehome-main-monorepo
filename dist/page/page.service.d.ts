import { CoreService } from '../core-service/core-service.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
export declare class PageService {
    private coreService;
    constructor(coreService: CoreService);
    create(createPageDto: CreatePageDto): Promise<any>;
    findAll(projectId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePageDto: UpdatePageDto): Promise<any>;
    remove(id: string): Promise<any>;
}
