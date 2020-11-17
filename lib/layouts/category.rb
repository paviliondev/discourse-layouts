class ::DiscourseLayouts::Category
  def self.update_bumped_at(category)
    return unless category
    
    if post = Post.find_by_id(category.latest_post_id)
      category.custom_fields["bumped_at"] = post.topic.bumped_at
      category.save_custom_fields(true)
    end
  end
end