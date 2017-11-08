# frozen_string_literal: true

require 'rails_helper'

describe ::DiscourseLayouts::WidgetController do
  routes { ::DiscourseLayouts::Engine.routes }

  before do
    log_in(:admin)
    DiscourseLayouts::WidgetHelper.set_widgets([])
    DiscourseLayouts::WidgetHelper.add_widget('test-widget', position: 'right', order: 'start')
  end

  describe 'all' do
    it "works" do
      get :all, format: :json
      expect(response).to be_success
      json = ::JSON.parse(response.body)
      expect(json['widgets'][0]['name']).to eq('test-widget')
    end
  end

  describe 'save' do
    it 'works' do
      put :save, params: { name: 'test-widget', position: 'start', order: 'left' }, format: :json
      expect(response).to be_success
      json = ::JSON.parse(response.body)
      expect(json['widget']['name']).to eq('test-widget')
      expect(json['widget']['position']).to eq('start')
      expect(json['widget']['order']).to eq('left')
    end
  end

  describe 'clear' do
    it 'works' do
      put :clear, params: { name: 'test-widget' }, format: :json
      expect(response).to be_success
      widgets = DiscourseLayouts::WidgetHelper.get_widgets
      expect(widgets.any? { |w| w.name == 'test-widget' }).to eq(false)
    end
  end
end
