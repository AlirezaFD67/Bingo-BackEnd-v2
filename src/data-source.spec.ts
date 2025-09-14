import AppDataSource from './data-source';

describe('Data Source', () => {
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

  it('should be a DataSource instance', () => {
    expect(AppDataSource.constructor.name).toBe('DataSource');
  });
});
