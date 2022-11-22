# frozen_string_literal: true

module DiscourseLayouts
  class Component < ActiveRecord::Base

    NAMESPACE = "layouts"

    BASE_ATTRS = %i[
      name
      nickname
      description
      theme_id
    ]

    attr_accessor :_default,
                  :default_url,
                  :default_about_url

    belongs_to :theme

    before_save do
      self.name = "#{NAMESPACE}-#{name}" unless name.starts_with?("#{NAMESPACE}-")
    end

    def enabled
      theme&.enabled
    end

    def default
      theme ? !!self.class.find_default_attrs(theme_name: theme.name) : _default
    end

    def url
      default ? default_url : theme&.remote_theme&.remote_url
    end

    def about_url
      default ? default_about_url : theme&.remote_theme&.about_url
    end

    def self.list(opts = {})
      components = self.all.to_a
      component_names = []

      components.each do |component|
        component_names << component.name
      end

      default_components.each do |attrs|
        next if component_names.include?(attrs[:name])

        theme = find_default_theme(attrs)
        attrs[:theme_id] = theme[:id] if theme

        component = self.new(attrs.slice(*BASE_ATTRS))
        component._default = true
        component.default_url = attrs[:url]
        component.default_about_url = attrs[:about_url]
        components << component
      end

      unless opts[:all]
        components = components.select { |component| component.enabled }
      end

      components
    end

    def self.find_default_theme(attrs)
      return nil unless attrs

      if Rails.env.development?
        default_themes.select { |theme| theme[:name] === attrs[:theme_name] }.first
      else
        default_themes.select { |theme| theme[:url] === attrs[:url] }.first
      end
    end

    def self.find_default_attrs(opts = {})
      return nil unless opts

      default_components.select do |component|
        opts.all? do |key, value|
          component[key] === value
        end
      end.first
    end

    def self.theme_component_query
      Theme.where('themes.component IS TRUE')
    end

    def self.default_themes_query
      if Rails.env.development?
        theme_component_query.where('name in (?)', default_theme_names)
      else
        theme_component_query
          .joins(:remote_theme)
          .where('remote_themes.remote_url in (?)', default_urls)
      end
    end

    def self.non_default_themes_query
      if Rails.env.development?
        theme_component_query.where('name not in (?)', default_theme_names)
      else
        theme_component_query
          .joins(:remote_theme)
          .where('remote_themes.remote_url not in (?)', default_urls)
      end
    end

    def self.default_themes
      @@default_themes ||= begin
        default_themes_query.map do |theme|
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
    end

    def self.default_components
      [
        {
          name: "layouts-category-list",
          nickname: "Category List",
          description: "Display a list of categories.",
          url: "https://github.com/paviliondev/layouts-category-list-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/category-list-widget/279",
          theme_name: "Layouts Category List Widget",
          default: true
        },
        {
          name: "layouts-groups-list",
          nickname: "Groups",
          description: "Allows each user to see what groups they are in.",
          url: "https://github.com/paviliondev/layouts-groups-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/groups-widget/288",
          theme_name: "Layouts Groups Widget",
          default: true
        },
        {
          name: "layouts-custom-html",
          nickname: "Custom HTML",
          description: "Display any custom HTML.",
          url: "https://github.com/paviliondev/layouts-custom-html.git",
          about_url: "https://discourse.pluginmanager.org/t/custom-html-widget/283",
          theme_name: "Layouts Custom Html",
          default: true
        },
        {
          name: "layouts-tag-list",
          nickname: "Tag List",
          description: "Display your site tags",
          url: "https://github.com/paviliondev/layouts-tag-list-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
          theme_name: "Layouts Tag List Widget",
          default: true
        },
        {
          name: "layouts-profile",
          nickname: "Profile",
          description: "Showing the current user's profile",
          url: "https://github.com/paviliondev/layouts-profile-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/tag-list-widget/287",
          theme_name: "Layouts Profile Widget",
          default: true
        },
        {
          name: "layouts-topic-lists",
          nickname: "Topic Lists",
          description: "Easily add custom text-based links to the header.",
          url: "https://github.com/paviliondev/layouts-topic-lists-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/topic-lists-widget/280",
          theme_name: "Layouts Topic Lists Widget",
          default: true
        },
        {
          name: "layouts-event-list",
          nickname: "Event List",
          description: "Display a list of events from the Discourse Event Plugin.",
          url: "https://github.com/paviliondev/layouts-event-list-widget.git",
          about_url: "https://discourse.pluginmanager.org/t/event-list-widget/286",
          theme_name: "Layouts Event List Widget",
          default: true
        }
      ]
    end

    def self.default_names
      default_components.map { |t| t[:name] }
    end

    def self.default_urls
      default_components.map { |t| t[:url] }
    end

    def self.default_theme_names
      default_components.map { |t| t[:theme_name] }
    end
  end
end

# == Schema Information
#
# Table name: discourse_layouts_components
#
#  id          :bigint           not null, primary key
#  name        :string           not null
#  nickname    :string
#  description :string
#  theme_id    :bigint
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_discourse_layouts_components_on_theme_id  (theme_id)
#
