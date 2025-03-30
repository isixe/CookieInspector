export interface Setting {
  historyLimit: number
}

export interface SettingContextType {
  setting: Setting
  updateSetting: (newSetting: Partial<Setting>) => void
}
