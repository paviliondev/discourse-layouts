# frozen_string_literal: true

module DiscourseLayouts
  class WidgetCategory < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets_categories'

    belongs_to :widget, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::Widget'
    belongs_to :category, foreign_key: 'category_id', class_name: '::Category'
  end
end

# == Schema Information
#
# Table name: discourse_layouts_widgets_categories
#
#  id          :bigint           not null, primary key
#  widget_id   :bigint           not null
#  category_id :bigint
#
# Indexes
#
#  index_discourse_layouts_widgets_categories_on_category_id  (category_id)
#  index_discourse_layouts_widgets_categories_on_widget_id    (widget_id)
#
# Foreign Keys
#
#  fk_rails_...  (widget_id => discourse_layouts_widgets.id)
#
