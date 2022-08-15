# frozen_string_literal: true

describe ::DiscourseLayouts::WidgetsController do
  fab!(:admin) { Fabricate(:admin) }

  before do
    sign_in(admin)
    DiscourseLayouts::Widget.set([])
    DiscourseLayouts::Widget.add('test-widget', position: 'right', order: 'start')
  end

  describe '#index' do
    it "lists widgets" do
      get "/admin/layouts/widgets.json"
      expect(response.status).to eq(200)
      expect(response.parsed_body[0]['name']).to eq('layouts-test-widget')
    end
  end

  describe '#save' do
    it 'saves a widget' do
      put "/admin/layouts/widgets/layouts-test-widget.json", params: {
        widget: { name: 'layouts-test-widget', position: 'start', order: 'left' }
      }
      expect(response.status).to eq(200)
      expect(response.parsed_body['widget']['name']).to eq('layouts-test-widget')
      expect(response.parsed_body['widget']['position']).to eq('start')
      expect(response.parsed_body['widget']['order']).to eq('left')
    end
  end

  describe '#remove' do
    it 'removes a widget' do
      delete "/admin/layouts/widgets/layouts-test-widget.json"
      expect(response.status).to eq(200)
      expect(DiscourseLayouts::Widget.get('layouts-test-widget')).to eq(nil)
    end
  end
end
