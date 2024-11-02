import { Knex } from "knex";

import { TableName } from "../schemas";
import { dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TableName.ConsumerSecret))) {
    await knex.schema.createTable(TableName.ConsumerSecret, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.uuid("userId").notNullable();
      t.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.uuid("orgId").notNullable();
      t.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.string("type").notNullable();
      t.text("key").notNullable();
      t.text("iv").notNullable();
      t.text("tag").notNullable();
      t.string("name").nullable();
      t.text("fields").notNullable();

      t.timestamps(true, true, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable(TableName.ConsumerSecret)) {
    await dropOnUpdateTrigger(knex, TableName.ConsumerSecret);

    await knex.schema.dropTable(TableName.ConsumerSecret);
  }
}
