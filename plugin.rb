# name: discourse-sidebars
# about: A plugin that allows widgets to be added to left and right sidebars in discovery and topic routes
# version: 0.1
# authors: Angus McLeod

register_asset 'stylesheets/sidebars-layout.scss'
register_asset 'stylesheets/sidebars-topic.scss'

after_initialize do
  Category.register_custom_field_type('sidebar_right_widgets', :string)
  Category.register_custom_field_type('sidebar_left_widgets', :string)
  Category.register_custom_field_type('sidebar_left_enabled', :string)
  Category.register_custom_field_type('sidebar_right_enabled', :string)
  Category.register_custom_field_type('sidebar_list_navigation_disabled', :string)
  Category.register_custom_field_type('sidebar_list_header_disabled', :string)
  add_to_serializer(:basic_category, :sidebar_right_widgets) {object.custom_fields["sidebar_right_widgets"]}
  add_to_serializer(:basic_category, :sidebar_left_widgets) {object.custom_fields["sidebar_left_widgets"]}
  add_to_serializer(:basic_category, :sidebar_left_enabled) {object.custom_fields["sidebar_left_enabled"]}
  add_to_serializer(:basic_category, :sidebar_right_enabled) {object.custom_fields["sidebar_right_enabled"]}
  add_to_serializer(:basic_category, :sidebar_list_navigation_disabled) {object.custom_fields["sidebar_list_navigation_disabled"]}
  add_to_serializer(:basic_category, :sidebar_list_header_disabled) {object.custom_fields["sidebar_list_header_disabled"]}
end
