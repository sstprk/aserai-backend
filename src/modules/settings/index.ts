import { Module } from "@medusajs/framework/utils"
import SettingsModuleService from "./service"

export const SETTINGS_MODULE = "settingsModuleService"

export default Module(SETTINGS_MODULE, {
  service: SettingsModuleService,
})
