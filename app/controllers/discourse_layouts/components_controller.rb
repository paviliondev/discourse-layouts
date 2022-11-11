# frozen_string_literal: true
module DiscourseLayouts
  class ComponentsController < ::Admin::AdminController
    def index
      if params[:installed]
        json = {
          components: Component.all
        }
      else
        json = {
          components: ActiveModel::ArraySerializer.new(
            Component.all_and_default,
            each_serializer: ComponentSerializer,
            root: false
          ),
          themes: DiscourseLayouts::Component.non_default_themes_query
        }
      end

      render_json_dump(json)
    end

    def install
      url = params[:url]

      begin
        theme = RemoteTheme.import_theme(url, current_user)
      rescue RemoteTheme::ImportError => e
        render_json_error e.message
      end

      component_attrs = Component.theme_component(theme)
      if !component_attrs
        render json: failed_json
      end

      component_attrs[:theme_id] = theme.id
      component = Component.create(component_attrs.slice(*Component::BASE_ATTRS))

      if component.errors.any?
        render_json_error(component)
      else
        render_serialized(component, ComponentSerializer, root: "component")
      end
    end

    def create
      component = Component.create(component_params)

      if component.errors.any?
        render_json_error(component)
      else
        render_serialized(component, ComponentSerializer, root: "component")
      end
    end

    def remove
      params.require(:id)

      if Component.destroy(params[:id])
        render json: success_json
      else
        render json: failed_json
      end
    end

    private

    def component_params
      @component_params ||= begin
        params.require(:component)
          .permit(
            :name,
            :nickname,
            :description,
            :theme_id
          ).to_h
      end
    end
  end
end
