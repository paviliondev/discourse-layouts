# frozen_string_literal: true
module DiscourseLayouts
  class WidgetsController < ::Admin::AdminController
    before_action :ensure_admin
    before_action :find_widget, only: [:save, :remove]

    def index
      widgets = Widget.list(all: true)
      render json: ActiveModel::ArraySerializer.new(
        widgets,
        each_serializer: DiscourseLayouts::WidgetSerializer,
        root: false
      )
    end

    def create
      widget = Widget.create(widget_params)

      if widget.errors.any?
        render_json_error(widget)
      else
        render json: success_json.merge(
          WidgetSerializer.new(widget, root: "widget").to_json
        )
      end
    end

    def save
      if @widget.update(widget_params)
        render json: success_json.merge(
          WidgetSerializer.new(@widget, root: "widget").as_json
        )
      else
        render_json_error(@widget)
      end
    end

    def remove
      params.require(:id)

      if Widget.where(id: params[:id]).destroy
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
