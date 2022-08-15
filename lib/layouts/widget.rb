# frozen_string_literal: true
class DiscourseLayouts::Widget
  include ActiveModel::SerializerSupport

  NAMESPACE = "layouts"

  attr_accessor :name,
                :position,
                :order,
                :groups,
                :category_ids,
                :excluded_category_ids,
                :filters,
                :contexts,
                :enabled

  def initialize(attrs = {})
    attrs = attrs.with_indifferent_access
    raise Discourse::InvalidParameters.new(:name) if attrs[:name].blank?

    @name = attrs[:name]
    @position = attrs[:position].present? ? attrs[:position] : 'left'
    @order = attrs[:order].present? ? attrs[:order] : 'start'

    [:groups, :category_ids, :excluded_category_ids, :filters, :contexts].each do |attr|
      val = attrs[attr].is_a?(Array) ? attrs[attr] : []
      val = val.map(&:to_i) if [:groups, :category_ids, :excluded_category_ids].include?(attr)
      val = val.map(&:to_s) if [:filters, :contexts].include?(attr)
      send("#{attr.to_s}=", val)
    end

    @enabled = ActiveModel::Type::Boolean.new.cast(attrs[:enabled])
  end

  def permitted?(guardian = nil)
    public = (groups.empty? ||
      groups.include?(Group::AUTO_GROUPS[:everyone])) &&
        (category_ids.empty? ||
          (category_ids & guardian.allowed_category_ids).any?)

    return true if public
    return false unless guardian.user

    can_see_a_cat = category_ids.empty? ||
      category_ids.include?(0) ||
      categories.any? { |category| guardian.can_see?(category) }
    group_member = groups.empty? ||
      GroupUser.where(group_id: groups, user_id: guardian.user.id).exists?

    group_member && can_see_a_cat
  end

  def categories
    @categories ||= Category.where(id: category_ids).to_a
  end

  def self.add(name, data = {})
    widgets = self.list(all: true)

    name = "#{NAMESPACE}-#{name}" unless name.starts_with?("#{NAMESPACE}-")

    if widgets.empty? || widgets.none? { |w| w.name == name }
      widget = self.new({ name: name }.merge(data))
      widgets.push(widget)

      if self.set(widgets)
        { widget: self.get(name) }
      else
        { error: 'failed to add widget' }
      end
    else
      { error: 'widget already exists' }
    end
  end

  def self.update(data)
    widgets = self.list(all: true)
    widgets.delete_if { |w| w.name == data[:name] }
    widgets.push(self.new(data))

    if self.set(widgets)

      ## Client needs to be fully refreshed due to use of site model.
      Site.clear_anon_cache!
      Discourse.request_refresh!

      { widget: self.get(data[:name]) }
    else
      { error: 'failed to update widget' }
    end
  end

  def self.remove(name)
    widgets = self.list(all: true)
    widgets.delete_if { |w| w.name == name }
    self.set(widgets)
  end

  def self.list(guardian: Guardian.new, all: false)
    data = (PluginStore.get('discourse-layouts', 'widgets') || [])
    widgets = data.map { |item| self.new(item) }

    if !all
      widgets = widgets.select do |widget|
        widget.enabled && widget.permitted?(guardian)
      end
    end

    widgets.sort_by { |widget| widget.name }
  end

  def self.set(widgets)
    PluginStore.set('discourse-layouts', 'widgets', widgets.map(&:as_json))
  end

  def self.get(name)
    self.list(all: true).select { |w| w.name == name }.first
  end
end
