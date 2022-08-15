# frozen_string_literal: true
module LayoutsCategoryExtension
  def update_latest
    super
    if SiteSetting.layouts_enabled
      DiscourseLayouts::Category.update_bumped_at(self)
    end
  end
end

module LayoutsCategoryClassExtension
  def update_stats
    super
    if SiteSetting.layouts_enabled
      Category.all.each do |category|
        DiscourseLayouts::Category.update_bumped_at(category)
      end
    end
  end
end

module LayoutsPostCreatorExtension
  def track_latest_on_category
    super
    if SiteSetting.layouts_enabled
      category = Category.find_by_id(@topic.category_id)
      DiscourseLayouts::Category.update_bumped_at(category)
    end
  end
end
