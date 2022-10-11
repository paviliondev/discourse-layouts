class CreateDiscourseLayoutsWidgets < ActiveRecord::Migration[7.0]
  def up
    create_table :discourse_layouts_widgets do |t|
      t.string :nickname
      t.string :name, null: false
      t.references :theme, null: false
      t.string :position
      t.string :widget_order
      t.integer :group_ids, array: true, default: []
      t.integer :category_ids, array: true, default: []
      t.integer :excluded_category_ids, array: true, default: []
      t.string :filters, array: true, default: []
      t.string :contexts, array: true, default: []
      t.boolean :enabled, default: false
    end

    add_index :discourse_layouts_widgets, [:nickname], unique: true

    execute <<~SQL
    INSERT INTO discourse_layouts_widgets (nickname, name, theme_id, position, widget_order, group_ids, category_ids, excluded_category_ids, filters, contexts, enabled)
    SELECT
      (CASE WHEN (X.value->>'nickname') IS NOT NULL THEN (X.value->>'nickname')::text ELSE (X.value->>'name')::text END) AS nickname,
      (X.value->>'name')::text AS name,
      (X.value->>'theme_id')::int AS theme_id,
      (X.value->>'position')::text AS position,
      (X.value->>'order')::text AS widget_order,
      NULLIF(ARRAY[jsonb_array_elements_text(X.value->'groups')]::int[], '{NULL}') AS group_ids,
      NULLIF(ARRAY[jsonb_array_elements_text(X.value->'category_ids')]::int[], '{NULL}') AS category_ids,
      NULLIF(ARRAY[jsonb_array_elements_text(X.value->'excluded_category_ids')]::int[], '{NULL}') AS excluded_category_ids,
      NULLIF(ARRAY[jsonb_array_elements_text(X.value->'filters')]::text[], '{NULL}') AS filters,
      NULLIF(ARRAY[jsonb_array_elements_text(X.value->'contexts')]::text[], '{NULL}') AS contexts,
      (X.value->>'enabled')::boolean AS enabled
    FROM (
      SELECT
        jsonb_array_elements(value::jsonb) AS value
      FROM plugin_store_rows WHERE plugin_name = 'discourse-layouts' AND key = 'widgets'
    ) AS X
    ON CONFLICT DO NOTHING
    SQL

    create_table :discourse_layouts_widgets_categories do |t|
      t.references :widget, index: true, null: false, foreign_key: { to_table: :discourse_layouts_widgets }
      t.references :category
    end

    execute <<~SQL
    INSERT INTO discourse_layouts_widgets_categories (widget_id, category_id)
    SELECT
      id AS widget_id,
      UNNEST(category_ids) AS category_id
    FROM discourse_layouts_widgets WHERE category_ids != '{}'
    ON CONFLICT DO NOTHING
    SQL

    create_table :discourse_layouts_widgets_groups do |t|
      t.references :widget, index: true, null: false, foreign_key: { to_table: :discourse_layouts_widgets }
      t.references :group
    end

    execute <<~SQL
    INSERT INTO discourse_layouts_widgets_groups (widget_id, group_id)
    SELECT
      id AS widget_id,
      UNNEST(group_ids) AS group_id
    FROM discourse_layouts_widgets WHERE group_ids != '{}'
    ON CONFLICT DO NOTHING
    SQL
  end

  def down
    drop_table :discourse_layouts_widgets_categories
    drop_table :discourse_layouts_widgets_groups
    drop_table :discourse_layouts_widgets
  end
end
