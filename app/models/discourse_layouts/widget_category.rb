# frozen_string_literal: true

module DiscourseLayouts
  class WidgetCategory < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets_categories'

    belongs_to :widget, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::Widget'
    belongs_to :category, foreign_key: 'category_id', class_name: '::Category'
  end
end
