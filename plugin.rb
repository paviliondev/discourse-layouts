# name: discourse-layouts
# about: A plugin that provides the infrastructure to create custom Discourse layouts, particularly sidebar layouts.
# version: 0.1
# authors: Angus McLeod

register_asset 'stylesheets/layouts.scss'
register_asset 'stylesheets/layouts-topic.scss'

after_initialize do
  Category.register_custom_field_type('layouts_sidebar_right_widgets', :string)
  Category.register_custom_field_type('layouts_sidebar_left_widgets', :string)
  Category.register_custom_field_type('layouts_sidebar_left_enabled', :string)
  Category.register_custom_field_type('layouts_sidebar_right_enabled', :string)
  Category.register_custom_field_type('layouts_list_navigation_disabled', :string)
  Category.register_custom_field_type('layouts_list_header_disabled', :string)
  Category.register_custom_field_type('layouts_list_nav_menu', :string)
  add_to_serializer(:basic_category, :layouts_sidebar_right_widgets) {object.custom_fields["layouts_sidebar_right_widgets"]}
  add_to_serializer(:basic_category, :layouts_sidebar_left_widgets) {object.custom_fields["layouts_sidebar_left_widgets"]}
  add_to_serializer(:basic_category, :layouts_sidebar_left_enabled) {object.custom_fields["layouts_sidebar_left_enabled"]}
  add_to_serializer(:basic_category, :layouts_sidebar_right_enabled) {object.custom_fields["layouts_sidebar_right_enabled"]}
  add_to_serializer(:basic_category, :layouts_list_navigation_disabled) {object.custom_fields["layouts_list_navigation_disabled"]}
  add_to_serializer(:basic_category, :layouts_list_header_disabled) {object.custom_fields["layouts_list_header_disabled"]}
  add_to_serializer(:basic_category, :layouts_list_nav_menu) {object.custom_fields["layouts_list_nav_menu"]}

  require_dependency "application_controller"
  module ::DiscourseLayouts
    class Engine < ::Rails::Engine
      engine_name "discourse_layouts"
      isolate_namespace DiscourseLayouts
    end
  end

  require_dependency "admin_constraint"
  Discourse::Application.routes.append do
    namespace :admin, constraints: AdminConstraint.new do
      mount ::DiscourseLayouts::Engine, at: "layouts"
    end
  end

  DiscourseLayouts::Engine.routes.draw do
    get "" => "widget#index"
    get "widgets" => "widget#all"
    put "save-widget" => "widget#save"
  end

  class DiscourseLayouts::WidgetHelper
    def self.add_widget(widget)
      available = PluginStore.get("discourse-layouts", "widgets") || []
      available = available | [widget]
      PluginStore.set("discourse-layouts", "widgets", available)
    end
  end

  class DiscourseLayouts::WidgetController < ::ApplicationController
    def index
      render nothing: true
    end

    def all
      available = PluginStore.get("discourse-layouts", "widgets") | []
      enabled = PluginStore.get("discourse-layouts", "site_widgets") || []
      all = []

      enabled.each do |e|
        all.push(e)
        available.delete(e['name'])
      end

      available.each do |a|
        all.push({name: a})
      end

      render json: success_json.merge(widgets: all)
    end

    def save
      params.require(:name)

      name = params[:name]
      position = params[:position]
      pinned = params[:pinned]

      widget = {name: name}

      if position.length > 1
        widget['position'] = position
      end

      if pinned.length > 1
        widget['pinned'] = pinned
      end

      site_widgets = PluginStore.get("discourse-layouts", "site_widgets") || []
      site_widgets.delete_if {|w| w['name'] == name}
      site_widgets.push(widget)

      PluginStore.set("discourse-layouts", "site_widgets", site_widgets)

      render json: success_json.merge(widget: widget)
    end
  end

  SiteSerializer.class_eval do
    attributes :widgets

    def widgets
      PluginStore.get("discourse-layouts", "site_widgets") || []
    end
  end
end
