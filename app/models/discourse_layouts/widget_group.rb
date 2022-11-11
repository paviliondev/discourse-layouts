# frozen_string_literal: true

module DiscourseLayouts
  class WidgetGroup < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets_groups'

    belongs_to :widget, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::Widget'
    belongs_to :group, foreign_key: 'group_id', class_name: '::Group'
  end
end

# == Schema Information
#
# Table name: discourse_layouts_widgets_groups
#
#  id        :bigint           not null, primary key
#  widget_id :bigint           not null
#  group_id  :bigint
#
# Indexes
#
#  index_discourse_layouts_widgets_groups_on_group_id   (group_id)
#  index_discourse_layouts_widgets_groups_on_widget_id  (widget_id)
#
# Foreign Keys
#
#  fk_rails_...  (widget_id => discourse_layouts_widgets.id)
#
