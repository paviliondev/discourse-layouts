# name: discourse-layouts
# about: A plugin that provides the infrastructure to create custom Discourse layouts, particularly sidebar layouts.
# version: 0.1
# authors: Angus McLeod

register_asset 'stylesheets/layouts.scss'
register_asset 'stylesheets/layouts-topic.scss'
register_asset 'stylesheets/layouts-civil.scss'

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
end
