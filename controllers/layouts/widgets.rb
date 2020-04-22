class DiscourseLayouts::WidgetsController < ::ApplicationController
  before_action :ensure_admin

  def index
    render json: MultiJson.dump(serialize_widgets)
  end

  def save    
    result = DiscourseLayouts::Widget.update(widget_params.to_h)
    
    if result[:widget]
      render json: success_json.merge(
        widget: DiscourseLayouts::WidgetSerializer.new(result[:widget], root: false)
      )
    else
      render json: failed_json
    end
  end

  def clear
    params.require(:name)
    result = DiscourseLayouts::Widget.clear(params[:name])

    if result
      render json: success_json.merge(
        widgets: serialize_widgets
      )
    else
      render json: failed_json
    end
  end
  
  private

  def serialize_widgets
    ActiveModel::ArraySerializer.new(
      DiscourseLayouts::Widget.list(all: true),
      each_serializer: DiscourseLayouts::WidgetSerializer,
      root: false
    )
  end
  
  def widget_params
    params.require(:widget)
      .permit(
        :name,
        :position,
        :order,
        :enabled,
        :source,
        groups: []
      )
  end
end
