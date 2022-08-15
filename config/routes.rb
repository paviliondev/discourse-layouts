# frozen_string_literal: true
DiscourseLayouts::Engine.routes.draw do
  get 'widgets' => 'widgets#index'
  put 'widgets/:name' => 'widgets#save'
  post 'widgets/:name' => 'widgets#create'
  delete 'widgets/:name' => 'widgets#remove'
end

Discourse::Application.routes.append do
  namespace :admin, constraints: AdminConstraint.new do
    mount ::DiscourseLayouts::Engine, at: 'layouts'
  end
end
