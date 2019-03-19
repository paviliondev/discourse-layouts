# name: discourse-layouts
# about: A plugin that provides the infrastructure to create custom Discourse layouts, particularly sidebar layouts.
# version: 0.1
# authors: Angus McLeod
# url: https://github.com/angusmcleod/discourse-layouts

register_asset 'stylesheets/common/layouts.scss'
register_asset 'stylesheets/common/layouts-topic.scss'
register_asset 'stylesheets/mobile/layouts.scss', :mobile

register_svg_icon "caret-right" if respond_to?(:register_svg_icon)
register_svg_icon "caret-down" if respond_to?(:register_svg_icon)

enabled_site_setting :layouts_enabled

after_initialize do
  Category.register_custom_field_type('layouts_sidebar_right_widgets', :string)
  Category.register_custom_field_type('layouts_sidebar_left_widgets', :string)
  Category.register_custom_field_type('layouts_sidebar_left_enabled', :string)
  Category.register_custom_field_type('layouts_sidebar_right_enabled', :string)
  Category.register_custom_field_type('layouts_list_navigation_disabled', :string)
  Category.register_custom_field_type('layouts_list_header_disabled', :string)
  Category.register_custom_field_type('layouts_list_nav_menu', :string)
  [
    "layouts_sidebar_right_widgets",
    "layouts_sidebar_left_widgets",
    "layouts_sidebar_left_enabled",
    "layouts_sidebar_right_enabled",
    "layouts_list_navigation_disabled",
    "layouts_list_header_disabled",
    "layouts_list_nav_menu"
  ].each do |key|
    Site.preloaded_category_custom_fields << key if Site.respond_to? :preloaded_category_custom_fields
    add_to_serializer(:basic_category, key.to_sym) { object.custom_fields[key] }
  end

  require_dependency 'application_controller'
  module ::DiscourseLayouts
    class Engine < ::Rails::Engine
      engine_name 'discourse_layouts'
      isolate_namespace DiscourseLayouts
    end
  end

  require_dependency 'admin_constraint'
  Discourse::Application.routes.append do
    namespace :admin, constraints: AdminConstraint.new do
      mount ::DiscourseLayouts::Engine, at: 'layouts'
    end
  end

  DiscourseLayouts::Engine.routes.draw do
    get '' => 'widget#index'
    get 'widgets' => 'widget#all'
    put 'save-widget' => 'widget#save'
    put 'clear-widget' => 'widget#clear'
  end

  load File.expand_path('../controllers/widget.rb', __FILE__)
  load File.expand_path('../lib/widget_helper.rb', __FILE__)

  SiteSerializer.class_eval do
    attributes :widgets

    def widgets
      DiscourseLayouts::WidgetHelper.get_widgets
    end
  end

  DiscourseEvent.trigger(:layouts_ready)
end
