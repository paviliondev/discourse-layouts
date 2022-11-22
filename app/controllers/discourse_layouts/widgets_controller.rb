# frozen_string_literal: true
module DiscourseLayouts
  class WidgetsController < ::Admin::AdminController
    before_action :find_widget, only: [:save, :toggle]

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

    def toggle
      @widget.enabled = ActiveRecord::Type::Boolean.new.cast(params[:state])

      if @widget.save
        render json: success_json
      else
        render json: failed_json
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
        result = params.require(:widget)
          .permit(
            :name,
            :nickname,
            :component_id,
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

        if result[:component_id]
          if result[:component_id].include?(Component::NAMESPACE)
            raise Discourse::InvalidParameters.new(:component_id) if Component.exists?(name: result[:component_id])

            attrs = Component.find_default_attrs(name: result[:component_id])

            raise Discourse::InvalidParameters.new(:component_id) unless attrs.present?

            theme = Component.find_default_theme(attrs)

            raise Discourse::InvalidParameters.new(:component_id) unless theme.present?

            component = Component.create!(
              name: attrs[:name],
              nickname: attrs[:nickname],
              description: attrs[:description],
              theme_id: theme[:id]
            )

            raise Discourse::InvalidParameters.new(:component_id) if component.errors.any?

            result[:component_id] = component.id
          else
            raise Discourse::InvalidParameters.new(:component_id) unless Component.exists?(result[:component_id])
          end
        end

        result
      end
    end

    def find_widget
      @widget = Widget.find(params[:id])
    end
  end
end
