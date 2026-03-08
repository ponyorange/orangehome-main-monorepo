import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
export declare class PageController {
    private readonly pageService;
    constructor(pageService: PageService);
    create(createPageDto: CreatePageDto): Promise<any>;
    findAll(projectId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePageDto: UpdatePageDto): Promise<any>;
    remove(id: string): Promise<any>;
}
