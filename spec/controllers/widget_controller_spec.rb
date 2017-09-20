# frozen_string_literal: true

require 'rails_helper'

describe ::DiscourseLayouts::WidgetController do
  routes { ::DiscourseLayouts::Engine.routes }

  before do
    log_in(:admin)
    DiscourseLayouts::WidgetHelper.set_widgets([])
    DiscourseLayouts::WidgetHelper.add_widget('test-widget')
  end

  describe 'all' do
    it "works" do
      xhr :get, :all
      expect(response).to be_success
      json = ::JSON.parse(response.body)
      expect(json['widgets'][0]['name']).to eq('test-widget')
    end
  end

  describe 'save' do
    it 'works' do
      xhr :put, :save, name: 'test-widget', position: 'start', order: 'left'
      expect(response).to be_success
      json = ::JSON.parse(response.body)
      expect(json['widget']['name']).to eq('test-widget')
      expect(json['widget']['position']).to eq('start')
      expect(json['widget']['order']).to eq('left')
    end
  end

  describe 'clear' do
    it 'works' do
      xhr :put, :clear, name: 'test-widget'
      expect(response).to be_success
      widgets = DiscourseLayouts::WidgetHelper.get_widgets
      expect(widgets.any? { |w| w.name == 'test-widget' }).to eq(false)
    end
  end
end
