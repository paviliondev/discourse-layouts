# frozen_string_literal: true
module DiscourseLayouts
  class WidgetsController < ::Admin::AdminController
    before_action :ensure_admin
    before_action :find_widget, only: [:save]

    def index
      render json: ActiveModel::ArraySerializer.new(
        Widget.list(all: true),
        each_serializer: DiscourseLayouts::WidgetSerializer,
        root: "widgets"
      )
    end

    def create
      widget = Widget.create(widget_params)

      if widget.errors.any?
        render_json_error(widget)
      else
        render_serialized(widget, WidgetSerializer, root: "widget")
      end
    end

    def save
      if @widget.update(widget_params)
        render_serialized(@widget, WidgetSerializer, root: "widget")
      else
        render_json_error(@widget)
      end
    end

    def remove
      params.require(:id)

      if Widget.destroy(params[:id])
        render json: success_json
      else
        render json: failed_json
      end
    end

    private

    def widget_params
      @widget_params ||= begin
        params.require(:widget)
          .permit(
            :name,
            :nickname,
            :theme_id,
            :position,
            :widget_order,
            :enabled,
            group_ids: [],
            category_ids: [],
            excluded_category_ids: [],
            filters: [],
            contexts: [],
            settings: {}
          ).to_h
      end
    end

    def find_widget
      @widget = Widget.find(params[:id])
    end
  end
end
