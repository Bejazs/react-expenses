import { readJson, writeJson } from './Storage';

export const META_KEY = 'meta';

export interface Meta {
  schemaVersion: number;
}

export interface Migration {
  /** Schema version reached after this migration runs. */
  version: number;
  description: string;
  migrate: () => Promise<void>;
}

/**
 * Ordered list of data migrations. Add new entries at the end with the next version.
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Estado inicial: despesas, categorias, rendimentos e definições sem alterações.',
    migrate: async () => {},
  },
];

export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/**
 * Runs every migration newer than the stored schema version, in order,
 * saving the version after each one so a failure never repeats a finished step.
 *
 * @returns The versions that were applied.
 */
export const runMigrations = async (migrations: Migration[] = MIGRATIONS): Promise<number[]> => {
  const meta = await readJson<Meta>(META_KEY, { schemaVersion: 0 });
  const applied: number[] = [];

  for (const migration of [...migrations].sort((a, b) => a.version - b.version)) {
    if (migration.version <= meta.schemaVersion) continue;
    await migration.migrate();
    meta.schemaVersion = migration.version;
    await writeJson(META_KEY, meta);
    applied.push(migration.version);
  }

  return applied;
};
