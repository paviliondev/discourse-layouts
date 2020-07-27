class DiscourseLayouts::WidgetSerializer < ::ApplicationSerializer
  attributes :name, :position, :order, :groups, :category_ids, :contexts, :filters, :enabled
end