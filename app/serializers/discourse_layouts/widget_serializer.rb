# frozen_string_literal: true
module DiscourseLayouts
  class WidgetSerializer < ::ApplicationSerializer
    attributes :id,
               :nickname,
               :position,
               :widget_order,
               :group_ids,
               :category_ids,
               :excluded_category_ids,
               :contexts,
               :filters,
               :enabled,
               :settings

    has_one :component, serializer: ComponentSerializer, embed: :object

    def category_ids
      object.categories.map(&:id)
    end

    def group_ids
      object.groups.map(&:id)
    end
  end
end
