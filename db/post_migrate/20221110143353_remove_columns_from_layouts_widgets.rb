class RemoveColumnsFromLayoutsWidgets < ActiveRecord::Migration[7.0]
  def change
    remove_column :discourse_layouts_widgets, :theme_id, :integer
    remove_column :discourse_layouts_widgets, :name, :string
  end
end
