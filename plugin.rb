# name: discourse-layouts
# about: A Discourse plugin that provides the infrastructure to create custom layouts.
# version: 0.1
# authors: Angus McLeod
# url: https://github.com/paviliondev/discourse-layouts

register_asset 'stylesheets/common/layouts.scss'

if respond_to?(:register_svg_icon)
  register_svg_icon "caret-right" 
  register_svg_icon "caret-down"
end

enabled_site_setting :layouts_enabled

after_initialize do  
  %w[
    layouts_sidebar_right_widgets
    layouts_sidebar_left_widgets
    layouts_sidebar_left_enabled
    layouts_sidebar_right_enabled
    layouts_list_navigation_disabled
    layouts_list_header_disabled
    layouts_list_nav_menu
  ].each do |key|
    register_category_custom_field_type(key, :string)
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.custom_fields[key] }
  end
  
  %w[
    ../lib/layouts/engine.rb
    ../lib/layouts/widget.rb
    ../config/routes.rb
    ../serializers/layouts/widget.rb
    ../controllers/layouts/widgets.rb
  ].each do |key|
    load File.expand_path(key, __FILE__)
  end
  
  add_to_serializer(:site, :layout_widgets) do
    ActiveModel::ArraySerializer.new(
      DiscourseLayouts::Widget.list(guardian: scope),
      each_serializer: DiscourseLayouts::WidgetSerializer
    )
  end

  DiscourseEvent.trigger(:layouts_ready)
end
