declare var self: any;

export default async function ensurePackageLoading() {
  if (self.__package) {
    return;
  }
  try {
    const res = await fetch("/package.json");
    self.__package = await res.json();
  } catch (e) {
    // no package.json
    self.__package = {
      dependencies: {},
      devDependencies: {}
    };
  }
}
