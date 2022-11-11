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
  end
end
