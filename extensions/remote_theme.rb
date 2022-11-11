# frozen_string_literal: true
module LayoutsRemoteThemeExtension
  def import_theme(url, user = Discourse.system_user, private_key: nil, branch: nil)
    theme = super

    if url.include?("layouts-")
      default_theme = Theme.find(SiteSetting.default_theme_id)
      theme.add_relative_theme!(:parent, default_theme)
    end

    theme
  end
end
