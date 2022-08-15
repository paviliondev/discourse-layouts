# frozen_string_literal: true
class DiscourseLayouts::WidgetsController < ::Admin::AdminController
  before_action :ensure_admin

  def index
    render json: MultiJson.dump(serialize_widgets)
  end

  def save
    handle_update_result(DiscourseLayouts::Widget.update(widget_params))
  end

  def create
    handle_update_result(DiscourseLayouts::Widget.add(widget_params[:name],
      widget_params.slice!(:name)
    ))
  end

  def remove
    params.require(:name)

    if DiscourseLayouts::Widget.remove(params[:name])
      render json: success_json
    else
      render json: failed_json
    end
  end

  private

  def handle_update_result(result)
    if result[:widget]
      render json: success_json.merge(
        widget: DiscourseLayouts::WidgetSerializer.new(result[:widget], root: false)
      )
    else
      render json: failed_json
    end
  end

  def serialize_widgets
    ActiveModel::ArraySerializer.new(
      DiscourseLayouts::Widget.list(all: true),
        each_serializer: DiscourseLayouts::WidgetSerializer,
        root: false
    )
  end

  def widget_params
    @widget_params ||= begin
      params.require(:widget)
        .permit(
          :name,
          :position,
          :order,
          :enabled,
          groups: [],
          category_ids: [],
          excluded_category_ids: [],
          filters: [],
          contexts: []
        ).to_h
    end
  end
end
