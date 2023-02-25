import { TableDefinition, TableSchema } from "~/typings";
import { default as equals } from 'fast-deep-equal';

export const QUERY_STYLE = {
	input: {
		fontFamily: 'JetBrains Mono'
	}
}

export const TABLE_TYPES = [
	{ label: 'Schemaless', value: 'schemaless' },
	{ label: 'Schemafull', value: 'schemafull' }
];

function buildPermission(type: string, value: string) {
	return ` FOR ${type} ${(value == 'FULL' || value == 'NONE') ? value : `WHERE ${value})`}`;
}

/**
 * Build the queries to update the entire table schema
 * 
 * @param previous Previous state
 * @param current Current state
 * @returns The queries to execute
 */
export function buildDefinitionQueries(previous: TableDefinition, current: TableDefinition) {
	const queries: string[] = [];

	if (!equals(previous.schema, current.schema)) {
		queries.push(buildSchemaDefinition(current.schema));
	}

	return queries.join(';\n');
}

/**
 * Update a table schema based on the given details
 * 
 * @param schema The table schema
 * @returns The query to update the schema
 */
export function buildSchemaDefinition(schema: TableSchema) {
	let query = `DEFINE TABLE ${schema.name}`;

	if (schema.drop) {
		query += ' DROP';
	}

	if (schema.schemafull) {
		query += ' SCHEMAFULL';
	} else {
		query += ' SCHEMALESS';
	}

	if (schema.view) {
		query += ` AS SELECT ${schema.view.expr} FROM ${schema.view.what}`;

		if (schema.view.cond) {
			query += ` WHERE ${schema.view.cond}`;
		}

		if (schema.view.group) {
			query += ` GROUP BY ${schema.view.group}`;
		}
	}

	query += ' PERMISSIONS';
	query += buildPermission('create', schema.permissions.create);
	query += buildPermission('select', schema.permissions.select);
	query += buildPermission('update', schema.permissions.update);
	query += buildPermission('delete', schema.permissions.delete);

	return query;
}