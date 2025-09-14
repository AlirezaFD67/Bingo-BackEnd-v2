import { AppDataSource } from './typeorm.config';

describe('TypeORM Config', () => {
  it('should export AppDataSource', () => {
    expect(AppDataSource).toBeDefined();
    expect(typeof AppDataSource).toBe('object');
  });

  it('should have correct options structure', () => {
    expect(AppDataSource.options).toBeDefined();
    expect(AppDataSource.options.type).toBeDefined();
    expect(AppDataSource.options.entities).toBeDefined();
    expect(AppDataSource.options.migrations).toBeDefined();
  });
});
