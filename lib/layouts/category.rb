class ::DiscourseLayouts::Category
  def self.update_bumped_at(category)
    return unless category
    
    if topic = Topic.find_by_id(category.latest_topic_id)
      category.custom_fields["bumped_at"] = topic.bumped_at
      category.save_custom_fields(true)
    end
  end
end