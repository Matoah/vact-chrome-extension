import SandboxManager from '../manager/private/SandboxManager';

const getSandbox = function () {
  const manager = SandboxManager.getInstance();
  return manager.get();
};

export function getScopeManager() {
  const sandbox = getSandbox();
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_interface_scope"
  ).ScopeManager;
}

export function getEventManager() {
  const sandbox = getSandbox();
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_interface_event"
  ).EventManager;
}

export function getWindowParam() {
  const sandbox = getSandbox();
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_runtime_param"
  ).WindowParam;
}

export function getComponentParam() {
  const sandbox = getSandbox();
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_runtime_param"
  ).ComponentParam;
}

export function getDatasourceManager() {
  const sandbox = getSandbox();
  return sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_manager_runtime_datasource"
  ).WindowDatasource;
}

export function getWindowMetadata(componentCode, windowCode) {
  const sandbox = getSandbox();
  return sandbox
    .getService(
      `vact.vjs.framework.extension.platform.init.view.schema.window.${componentCode}.${windowCode}`
    )
    ?.getWindowDefine()
    ?.getWindowMetadata();
}

export function getComponentMetadata(componentCode) {
  const sandbox = getSandbox();
  return sandbox
    .getService(
      `vact.vjs.framework.extension.platform.init.view.schema.component.${componentCode}`
    )
    ?.default?.returnComponentSchema();
}

export function getComponentRoute() {
  const sandbox = getSandbox();
  const routeSchema = sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_schema_route"
  );
  return routeSchema.ComponentRoute;
}

export function getWindowRoute() {
  const sandbox = getSandbox();
  const routeSchema = sandbox.getService(
    "v_act_vjs_framework_extension_platform_data_storage_schema_route"
  );
  return routeSchema.WindowRoute;
}
