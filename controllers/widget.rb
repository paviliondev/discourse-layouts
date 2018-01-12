class DiscourseLayouts::WidgetController < ::ApplicationController
  before_action :ensure_admin

  def index
    render nothing: true
  end

  def all
    render json: success_json.merge(widgets: DiscourseLayouts::WidgetHelper.get_widgets)
  end

  def save
    params.require(:name)
    params.permit(:position, :order)

    widget = { name: params[:name] }
    widget['position'] = params[:position] if params[:position].length > 1
    widget['order'] = params[:order] unless params[:order].empty?

    result = DiscourseLayouts::WidgetHelper.update_widget(widget)

    if result
      render json: success_json.merge(widget: widget)
    else
      render json: failed_json
    end
  end

  def clear
    params.require(:name)

    result = DiscourseLayouts::WidgetHelper.clear_widget(params[:name])

    if result
      render json: success_json
    else
      render json: failed_json
    end
  end
end
