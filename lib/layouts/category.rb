# frozen_string_literal: true
class ::DiscourseLayouts::Category
  def self.update_bumped_at(category)
    return unless category

    post = Post.find_by_id(category.latest_post_id)

    if post && post.respond_to?('topic') && post.topic
      latest_date = [post.topic.bumped_at, post.topic.updated_at].compact.max
      category.custom_fields["bumped_at"] = latest_date
      category.save_custom_fields(true)
    end
  end
end
