# frozen_string_literal: true
DiscourseLayouts::Engine.routes.draw do
  get 'widgets' => 'widgets#index'
  post 'widgets/new' => 'widgets#create'
  put 'widgets/:id' => 'widgets#save'
  delete 'widgets/:id' => 'widgets#remove'
  get 'components' => 'components#index'
end

Discourse::Application.routes.append do
  namespace :admin, constraints: AdminConstraint.new do
    mount ::DiscourseLayouts::Engine, at: 'layouts'
  end
end
