# frozen_string_literal: true
module DiscourseLayouts
  class ComponentSerializer < ::ApplicationSerializer
    attributes  :id,
                :name,
                :nickname,
                :description,
                :default,
                :url,
                :about_url,
                :theme_id,
                :enabled

    def id
      # Default components not yet saved don't have an id.
      object.id.present? ? object.id : object.name
    end
  end
end
