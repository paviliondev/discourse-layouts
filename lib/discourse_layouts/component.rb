class ::DiscourseLayouts::Component
  include ActiveModel::Serialization

  ATTRIBUTES = %i[
    name
    nickname
    description
    url
    meta_url
    installed
    theme_id
    theme_name
  ]

  def initialize(attrs)
    ATTRIBUTES.each do |attr|
      self.class.send(:attr_reader, attr)

      case attr
      when :installed
        instance_variable_set("@#{attr}", !!attrs[attr])
      else
        instance_variable_set("@#{attr}", attrs[attr])
      end
    end
  end

  def self.list
    available.map do |component|
      theme = component_theme(component)

      if theme
        component[:installed] = true
        component[:theme_id] = theme[:id]
      end

      self.new(component)
    end
  end

  def self.component_theme(component)
    if Rails.env.development?
      themes.select { |theme| theme[:name] === component[:theme_name] }.first
    else
      themes.select { |theme| theme[:url] === component[:url] }.first
    end
  end

  def self.theme_query
    if Rails.env.development?
      Theme.where('name in (?)', available_theme_names)
    else
      Theme
        .joins(:remote_theme)
        .where('remote_themes.remote_url in (?)', available_urls)
    end
  end

  def self.themes
    theme_query.map do |theme|
      result = {
        id: theme.id,
        name: theme.name
      }

      unless Rails.env.development?
        result[:url] = theme.remote_theme.remote_url
      end

      result
    end
  end

  def self.available
    [
      {
        name: "layouts-category-list",
        nickname: "Category List",
        description: "Display a list of categories.",
        url: "https://github.com/paviliondev/layouts-category-list-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/category-list-widget/279",
        theme_name: "Layouts Category List Widget"
      },
      {
        name: "layouts-groups-list",
        nickname: "Groups",
        description: "Allows each user to see what groups they are in.",
        url: "https://github.com/paviliondev/layouts-groups-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/groups-widget/288",
        theme_name: "Layouts Groups Widget"
      },
      {
        name: "layouts-custom-html",
        nickname: "Custom HTML",
        description: "Display any custom HTML.",
        url: "https://github.com/paviliondev/layouts-custom-html.git",
        meta_url: "https://discourse.pluginmanager.org/t/custom-html-widget/283",
        theme_name: "Layouts Custom Html"
      },
      {
        name: "layouts-tag-list",
        nickname: "Tag List",
        description: "Display your site tags",
        url: "https://github.com/paviliondev/layouts-tag-list-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
        theme_name: "Layouts Tag List Widget"
      },
      {
        name: "layouts-profile",
        nickname: "Profile",
        description: "Showing the current user's profile",
        url: "https://github.com/paviliondev/layouts-profile-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
        theme_name: "Layouts Profile Widget"
      },
      {
        name: "layouts-topic-lists",
        nickname: "Topic Lists",
        description: "Easily add custom text-based links to the header.",
        url: "https://github.com/paviliondev/layouts-topic-lists-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/topic-lists-widget/280",
        theme_name: "Layouts Topic Lists Widget"
      },
      {
        name: "layouts-event-list",
        nickname: "Event List",
        description: "Display a list of events from the Events Plugin.",
        url: "https://github.com/paviliondev/layouts-event-list-widget.git",
        meta_url: "https://discourse.pluginmanager.org/t/event-list-widget/286",
        theme_name: "Layouts Event List Widget"
      }
    ]
  end

  def self.available_urls
    available.map { |t| t[:url] }
  end

  def self.available_theme_names
    available.map { |t| t[:theme_name] }
  end
end
