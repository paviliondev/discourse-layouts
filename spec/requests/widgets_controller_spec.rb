# frozen_string_literal: true

describe ::DiscourseLayouts::WidgetsController do
  fab!(:admin) { Fabricate(:admin) }
  fab!(:widget) { Fabricate(:discourse_layouts_widget) }
  fab!(:component) { Fabricate(:discourse_layouts_component) }

  before do
    sign_in(admin)
  end

  describe '#index' do
    it "lists widgets" do
      get "/admin/layouts/widgets.json"
      expect(response.status).to eq(200)
      expect(response.parsed_body[0]['nickname']).to eq(widget.nickname)
    end
  end

  describe '#save' do
    it 'saves a widget' do
      put "/admin/layouts/widgets/#{widget.id}.json", params: {
        widget: {
          nickname: 'New widget',
          component_id: component.id,
          position: 'start',
          widget_order: 'left'
        }
      }
      expect(response.status).to eq(200)
      expect(response.parsed_body['widget']['nickname']).to eq('New widget')
      expect(response.parsed_body['widget']['component']['id']).to eq(component.id)
      expect(response.parsed_body['widget']['widget_order']).to eq('left')
    end
  end

  describe '#remove' do
    it 'removes a widget' do
      delete "/admin/layouts/widgets/#{widget.id}.json"
      expect(response.status).to eq(200)
      expect(DiscourseLayouts::Widget.exists?(widget.id)).to eq(false)
    end
  end
end
