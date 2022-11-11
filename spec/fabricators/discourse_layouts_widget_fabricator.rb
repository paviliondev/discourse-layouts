# frozen_string_literal: true

Fabricator(:discourse_layouts_widget, from: "DiscourseLayouts::Widget") do
  nickname { "Custom Widget" }
  description { "A Custom Layout Widget" }
  component { Fabricate(:discourse_layouts_component) }
end
