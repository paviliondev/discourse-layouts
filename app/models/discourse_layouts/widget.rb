# frozen_string_literal: true

module DiscourseLayouts
  class Widget < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets'

    has_many :widget_groups, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::WidgetGroup', dependent: :destroy
    has_many :groups, through: :widget_groups
    has_many :widget_categories, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::WidgetCategory', dependent: :destroy
    has_many :categories, through: :widget_categories

    belongs_to :component, foreign_key: 'component_id', class_name: 'DiscourseLayouts::Component'

    after_save do
      Site.clear_anon_cache!
      Discourse.request_refresh!
    end

    def enabled
      self[:enabled] && self.component&.enabled
    end

    def permitted?(guardian = nil)
      public = (groups.empty? ||
        groups.include?(Group::AUTO_GROUPS[:everyone])) &&
          (
            categories.empty? ||
            (categories.map(&:id) & guardian.allowed_category_ids).any?
          )

      return true if public
      return false unless guardian.user

      can_see_a_cat = categories.empty? || categories.any? { |c| guardian.can_see?(c) }
      group_member = groups.empty? ||
        GroupUser.where(group_id: groups, user_id: guardian.user.id).exists?

      group_member && can_see_a_cat
    end

    def self.list(guardian: Guardian.new, all: false)
      widgets = self.all
      widgets = widgets.select { |w| w.enabled && w.permitted?(guardian) } if !all
      widgets
    end
  end
end

# == Schema Information
#
# Table name: discourse_layouts_widgets
#
#  id                    :bigint           not null, primary key
#  nickname              :string
#  position              :string
#  widget_order          :string
#  excluded_category_ids :integer          default([]), is an Array
#  filters               :string           default([]), is an Array
#  contexts              :string           default([]), is an Array
#  enabled               :boolean          default(FALSE)
#  settings              :json
#  component_id          :bigint
#
# Indexes
#
#  index_discourse_layouts_widgets_on_component_id  (component_id)
#  index_discourse_layouts_widgets_on_nickname      (nickname) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (component_id => discourse_layouts_components.id)
#
