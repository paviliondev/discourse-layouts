class DiscourseLayouts::WidgetSerializer < ::ApplicationSerializer
  attributes :name,
             :position,
             :order,
             :groups,
             :category_ids,
             :excluded_category_ids,
             :contexts,
             :filters,
             :enabled
end