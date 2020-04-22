class DiscourseLayouts::WidgetSerializer < ::ApplicationSerializer
  attributes :name, :position, :order, :groups, :enabled, :source
end