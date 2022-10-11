# frozen_string_literal: true

module DiscourseLayouts
  class Widget < ActiveRecord::Base
    self.table_name = 'discourse_layouts_widgets'

    has_many :widget_groups, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::WidgetGroup', dependent: :destroy
    has_many :groups, through: :widget_groups
    has_many :widget_categories, foreign_key: 'widget_id', class_name: 'DiscourseLayouts::WidgetCategory', dependent: :destroy
    has_many :categories, through: :widget_categories

    NAMESPACE = "layouts"

    before_save do
      self.name = "#{NAMESPACE}-#{self.name}" unless self.name.starts_with?("#{NAMESPACE}-")
    end

    after_save do
      Site.clear_anon_cache!
      Discourse.request_refresh!
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
      widgets.sort_by { |widget| widget.name }
    end
  end
end
