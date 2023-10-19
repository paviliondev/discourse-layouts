# frozen_string_literal: true
# name: discourse-layouts
# about: A framework for custom Discourse layouts.
# version: 0.3.5
# authors: Angus McLeod, Keegan George
# contact_emails: development@pavilion.tech
# url: https://github.com/paviliondev/discourse-layouts

register_asset 'stylesheets/common/layouts.scss'

if respond_to?(:register_svg_icon)
  register_svg_icon "caret-right"
  register_svg_icon "caret-down"
  register_svg_icon "save"
end

enabled_site_setting :layouts_enabled

after_initialize do
  %w[
    ../lib/layouts/engine.rb
    ../lib/layouts/widget.rb
    ../lib/layouts/category.rb
    ../extensions/category_bumped_at.rb
    ../config/routes.rb
    ../app/serializers/layouts/widget_serializer.rb
    ../app/controllers/layouts/widgets_controller.rb
  ].each do |key|
    load File.expand_path(key, __FILE__)
  end

  add_to_serializer(:site, :layout_widgets) do
    ActiveModel::ArraySerializer.new(
      DiscourseLayouts::Widget.list(guardian: scope),
        each_serializer: DiscourseLayouts::WidgetSerializer
    )
  end

  ### Discourse modifications for widgets

  TopicQuery.public_valid_options.push(:no_definitions, :limit, :per_page)

  #### Add bumped_at to categories and serialize it with site categories

  ::Category.prepend LayoutsCategoryExtension
  ::Category.singleton_class.prepend LayoutsCategoryClassExtension
  ::PostCreator.prepend LayoutsPostCreatorExtension

  Site.preloaded_category_custom_fields << "bumped_at"
  add_to_serializer(:site_category, :bumped_at) { object.custom_fields['bumped_at'] }
end
