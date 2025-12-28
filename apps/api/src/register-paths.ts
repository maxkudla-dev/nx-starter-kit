import path from 'path';
import Module from 'module';

type ResolveFilename = (
  request: string,
  parent: NodeJS.Module | null,
  isMain: boolean,
  options?: { paths?: string[] }
) => string;

const runtimeRoot = path.resolve(__dirname, '..', '..', '..');
const utilsBasePath = path.join(runtimeRoot, 'libs', 'utils', 'src');
const baseAlias = '@nx-utils-library';
const aliasPrefix = `${baseAlias}/`;

const moduleWithResolve = Module as typeof Module & { _resolveFilename: ResolveFilename };
const originalResolve = moduleWithResolve._resolveFilename;

moduleWithResolve._resolveFilename = (request, parent, isMain, options) => {
  if (request === baseAlias) {
    return originalResolve.call(moduleWithResolve, utilsBasePath, parent, isMain, options);
  }

  if (request.startsWith(aliasPrefix)) {
    const mapped = path.join(utilsBasePath, request.slice(aliasPrefix.length));
    return originalResolve.call(moduleWithResolve, mapped, parent, isMain, options);
  }

  return originalResolve.call(moduleWithResolve, request, parent, isMain, options);
};
