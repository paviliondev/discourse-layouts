# frozen_string_literal: true
module DiscourseLayouts
  class ComponentsController < ::Admin::AdminController
    def index
      render json: ActiveModel::ArraySerializer.new(
        Component.list,
        each_serializer: ComponentSerializer,
        root: "components"
      )
    end
  end
end
