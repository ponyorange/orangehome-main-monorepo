import { CoreService } from '../core-service/core-service.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectService {
    private coreService;
    constructor(coreService: CoreService);
    create(createProjectDto: CreateProjectDto): Promise<any>;
    findAll(userId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<any>;
    remove(id: string): Promise<any>;
}
