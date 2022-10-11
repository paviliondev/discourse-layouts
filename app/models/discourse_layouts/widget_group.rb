# frozen_string_literal: true

module DiscourseLayouts
  class WidgetGroup < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets_groups'

    belongs_to :widget, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::Widget'
    belongs_to :group, foreign_key: 'group_id', class_name: '::Group'
  end
end
