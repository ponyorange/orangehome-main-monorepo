import { IsIn, IsMongoId } from 'class-validator';

export type RuntimeType = 'release' | 'preview' | 'dev';

export class RuntimeParamsDto {
  @IsIn(['release', 'preview', 'dev'])
  type!: RuntimeType;

  @IsMongoId()
  pageid!: string;
}
