import type { ISchema } from '../../types/base';
import { deserialize, validate } from '../../common/base/schemaOperator';

export class ImportService {
  async importFromFile(file: File): Promise<ISchema> {
    const content = await file.text();
    return this.importFromJSON(content);
  }

  importFromJSON(json: string): ISchema {
    const schema = deserialize(json);
    if (!schema) {
      throw new Error('导入失败：JSON 解析失败或 Schema 无效');
    }
    return schema;
  }

  validateSchema(schema: ISchema): boolean {
    return validate(schema);
  }
}

export const importService = new ImportService();
