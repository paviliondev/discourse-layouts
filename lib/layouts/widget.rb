class DiscourseLayouts::Widget
  include ActiveModel::SerializerSupport
  
  NAMESPACE = "layouts"
  
  attr_accessor :name, :position, :order, :groups, :enabled
  
  def initialize(attrs={})
    attrs = attrs.with_indifferent_access
    raise Discourse::InvalidParameters.new(:name) if attrs[:name].blank?
    
    @name = attrs[:name]
    @position = attrs[:position].present? ? attrs[:position] : 'left'
    @order = attrs[:order].present? ? attrs[:order] : 'start'
    
    if attrs[:groups].is_a?(Array)
      @groups = attrs[:groups].map(&:to_i)
    else
      @groups = []
    end
    
    if ["true", "false", true, false].include?(attrs[:enabled])
      @enabled = ActiveModel::Type::Boolean.new.cast(attrs[:enabled])
    else
      @enabled = false
    end
  end
  
  def permitted?(user)
    return false if groups.empty?
    return true if groups.include?(Group::AUTO_GROUPS[:everyone])
    return false if !user
    GroupUser.where(group_id: groups, user_id: user.id).exists?
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
        widget.enabled && widget.permitted?(guardian.user)
      end
    end
    
    widgets.sort_by {|widget| widget.name }
  end

  def self.set(widgets)
    PluginStore.set('discourse-layouts', 'widgets', widgets.map(&:as_json))
  end
  
  def self.get(name)
    self.list(all: true).select { |w| w.name == name }.first
  end
end