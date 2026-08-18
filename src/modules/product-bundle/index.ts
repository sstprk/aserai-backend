import { Module } from "@medusajs/framework/utils"
import ProductBundleModuleService from "./service"

export const PRODUCT_BUNDLE_MODULE = "productBundleModuleService"

export default Module(PRODUCT_BUNDLE_MODULE, {
  service: ProductBundleModuleService,
})
