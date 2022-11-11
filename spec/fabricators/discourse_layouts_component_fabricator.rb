# frozen_string_literal: true

Fabricator(:discourse_layouts_component, from: "DiscourseLayouts::Component") do
  name { "layouts-custom-widget" }
  nickname { "Custom Component" }
  description { "A Custom Layout Component" }
  theme { Fabricate(:theme) }
end
