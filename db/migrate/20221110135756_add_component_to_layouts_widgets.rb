class AddComponentToLayoutsWidgets < ActiveRecord::Migration[7.0]
  def change
    add_reference :discourse_layouts_widgets, :component, index: true, foreign_key: { to_table: :discourse_layouts_components }
  end
end
