# frozen_string_literal: true
class CreateDiscourseLayoutsComponents < ActiveRecord::Migration[7.0]
  def change
    create_table :discourse_layouts_components do |t|
      t.string :name, null: false
      t.string :nickname
      t.string :description
      t.references :theme

      t.timestamps
    end
  end
end
