class RemoveArrayColumnsFromLayoutsWidgets < ActiveRecord::Migration[7.0]
  def change
    remove_column :discourse_layouts_widgets, :category_ids, :integer
    remove_column :discourse_layouts_widgets, :group_ids, :integer
  end
end
