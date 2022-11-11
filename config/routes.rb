# frozen_string_literal: true
DiscourseLayouts::Engine.routes.draw do
  get 'widgets' => 'widgets#index'
  post 'widgets/new' => 'widgets#create'
  put 'widgets/:id' => 'widgets#save'
  put 'widgets/:id/toggle' => 'widgets#toggle'
  delete 'widgets/:id' => 'widgets#remove'
  get 'components' => 'components#index'
  post 'components/install' => 'components#install'
  post 'components/new' => 'components#create'
  delete 'components/:id' => 'components#remove'
end

Discourse::Application.routes.append do
  namespace :admin, constraints: AdminConstraint.new do
    mount ::DiscourseLayouts::Engine, at: 'layouts'
  end
end
