# frozen_string_literal: true

describe ::DiscourseLayouts::ComponentsController do
  fab!(:admin) { Fabricate(:admin) }
  fab!(:component) { Fabricate(:discourse_layouts_component) }
  fab!(:theme) { Fabricate(:theme) }

  before do
    sign_in(admin)
  end

  describe '#index' do
    it "lists components" do
      get "/admin/layouts/components.json"
      expect(response.status).to eq(200)
      expect(response.parsed_body['components'].select { |c| c['name'] === component.name }.size).to eq(1)
    end
  end

  describe '#create' do
    it 'creates a component' do
      post "/admin/layouts/components/new.json", params: {
        component: {
          name: "layouts-new-custom-widget",
          nickname: "New Custom",
          theme_id: theme.id
        }
      }
      expect(response.status).to eq(200)
      expect(response.parsed_body['component']['name']).to eq('layouts-new-custom-widget')
      expect(response.parsed_body['component']['nickname']).to eq('New Custom')
      expect(response.parsed_body['component']['theme_id']).to eq(theme.id)
    end
  end

  describe '#remove' do
    it 'removes a widget' do
      delete "/admin/layouts/components/#{component.id}.json"
      expect(response.status).to eq(200)
      expect(DiscourseLayouts::Component.exists?(component.id)).to eq(false)
    end
  end
end
