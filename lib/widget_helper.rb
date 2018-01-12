class DiscourseLayouts::WidgetHelper
  def self.add_widget(name, opts = {})
    widgets = get_widgets

    if widgets.empty? || widgets.none? { |w| w['name'] == name }
      widget = { name: name }
      widget[:position] = opts[:position] if opts[:position]
      widget[:order] = opts[:order] if opts[:order]
      widgets = widgets.push(widget)
    end

    set_widgets(widgets)
  end

  def self.update_widget(widget)
    widgets = get_widgets

    widgets.delete_if do |w|
      w['name'] == widget[:name]
    end

    widgets.push(widget)

    set_widgets(widgets)
  end

  def self.clear_widget(name)
    widgets = get_widgets

    widgets.delete_if { |w| w['name'] == name }

    set_widgets(widgets)
  end

  def self.get_widgets
    PluginStore.get('discourse-layouts', 'widgets') || []
  end

  def self.set_widgets(widgets)
    PluginStore.set('discourse-layouts', 'widgets', widgets)
  end
end
