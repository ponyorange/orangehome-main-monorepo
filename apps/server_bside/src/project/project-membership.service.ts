import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

export type ProjectMemberFields = {
  owner?: string;
  collaborators?: string[];
};

@Injectable()
export class ProjectMembershipService {
  constructor(private readonly authService: AuthService) {}

  isMember(userEmail: string, project: ProjectMemberFields): boolean {
    const email = userEmail.trim();
    const owner = (project.owner || '').trim();
    if (owner && owner === email) {
      return true;
    }
    const list = project.collaborators || [];
    return list.some((c) => (c || '').trim() === email);
  }

  async getCallerEmail(authHeader?: string): Promise<string> {
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      throw new UnauthorizedException('请提供有效的 Bearer Token');
    }
    const user = await this.authService.getCurrentUser(accessToken);
    if (!user?.email) {
      throw new UnauthorizedException('请提供有效的 Bearer Token');
    }
    return user.email.trim();
  }

  async requireProjectMember(authHeader: string | undefined, project: ProjectMemberFields): Promise<void> {
    const email = await this.getCallerEmail(authHeader);
    if (!this.isMember(email, project)) {
      throw new ForbiddenException('无权限操作该项目');
    }
  }
}
