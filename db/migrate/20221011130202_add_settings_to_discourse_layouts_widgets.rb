# frozen_string_literal: true
class AddSettingsToDiscourseLayoutsWidgets < ActiveRecord::Migration[7.0]
  def change
    add_column :discourse_layouts_widgets, :settings, :json
  end
end
