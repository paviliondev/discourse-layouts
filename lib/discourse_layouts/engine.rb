# frozen_string_literal: true
module ::DiscourseLayouts
  PLUGIN_NAME ||= 'discourse-layouts'

  class Engine < ::Rails::Engine
    engine_name PLUGIN_NAME
    isolate_namespace DiscourseLayouts
  end
end
