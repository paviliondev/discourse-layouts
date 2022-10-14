# frozen_string_literal: true
class DiscourseLayouts::ComponentSerializer < ::ApplicationSerializer
  attributes  :name,
              :nickname,
              :description,
              :url,
              :meta_url,
              :installed,
              :theme_id,
              :theme_name
end
