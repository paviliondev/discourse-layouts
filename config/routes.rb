DiscourseLayouts::Engine.routes.draw do
  get 'widgets' => 'widgets#index'
  put 'widgets/:name' => 'widgets#save'
  post 'widgets/:name' => 'widgets#create'
  delete 'widgets/:name' => 'widgets#remove'
end

require_dependency 'admin_constraint'
Discourse::Application.routes.append do
  namespace :admin, constraints: AdminConstraint.new do
    mount ::DiscourseLayouts::Engine, at: 'layouts'
  end
end