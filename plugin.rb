# name: discourse-layouts
# about: A framework for custom Discourse layouts.
# version: 0.2
# authors: Angus McLeod
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
  
  ### Discourse modifications for widgets
  
  TopicQuery.public_valid_options.push(:no_definitions, :limit, :per_page)
end
