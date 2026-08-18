import { Module } from "@medusajs/framework/utils"
import ApiCredentialModuleService from "./service"

export const API_CREDENTIAL_MODULE = "apiCredentialModuleService"

export default Module(API_CREDENTIAL_MODULE, {
  service: ApiCredentialModuleService,
})
