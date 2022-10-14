# frozen_string_literal: true
class DiscourseLayouts::WidgetSerializer < ::ApplicationSerializer
  attributes :id,
             :nickname,
             :name,
             :position,
             :theme_id,
             :component,
             :widget_order,
             :group_ids,
             :category_ids,
             :excluded_category_ids,
             :contexts,
             :filters,
             :enabled,
             :settings

  def category_ids
    object.categories.map(&:id)
  end

  def group_ids
    object.groups.map(&:id)
  end

  def component
    {
      id: object.theme.id,
      name: object.theme.name,
      enabled: object.theme.enabled
    }
  end
end
