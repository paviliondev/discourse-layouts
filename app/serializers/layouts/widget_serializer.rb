# frozen_string_literal: true
class DiscourseLayouts::WidgetSerializer < ::ApplicationSerializer
  attributes :nickname,
             :name,
             :theme_id,
             :position,
             :order,
             :groups,
             :category_ids,
             :excluded_category_ids,
             :contexts,
             :filters,
             :enabled,
             :settings
end
