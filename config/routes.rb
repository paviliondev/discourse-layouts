DiscourseLayouts::Engine.routes.draw do
  get 'widgets' => 'widgets#index'
  put 'widgets/:name' => 'widgets#save'
  delete 'widgets/:name' => 'widgets#clear'
end

require_dependency 'admin_constraint'
Discourse::Application.routes.append do
  namespace :admin, constraints: AdminConstraint.new do
    mount ::DiscourseLayouts::Engine, at: 'layouts'
  end
end