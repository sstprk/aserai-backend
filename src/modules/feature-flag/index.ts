import { Module } from "@medusajs/framework/utils"
import FeatureFlagModuleService from "./service"

export const FEATURE_FLAG_MODULE = "featureFlagModuleService"

export default Module(FEATURE_FLAG_MODULE, {
  service: FeatureFlagModuleService,
})
