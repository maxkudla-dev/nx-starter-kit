import path from 'path';
import Module from 'module';

type ResolveFilename = (
  request: string,
  parent: NodeJS.Module | null,
  isMain: boolean,
  options?: { paths?: string[] }
) => string;

const runtimeRoot = path.resolve(__dirname, '..', '..', '..');
const aliases = [
  {
    base: '@nx-utils-library',
    target: path.join(runtimeRoot, 'libs', 'utils', 'src'),
  },
  {
    base: '@nx-apollo-auth-library',
    target: path.join(runtimeRoot, 'libs', 'apollo-auth', 'src'),
  },
];

const moduleWithResolve = Module as typeof Module & { _resolveFilename: ResolveFilename };
const originalResolve = moduleWithResolve._resolveFilename;

moduleWithResolve._resolveFilename = (request, parent, isMain, options) => {
  for (const { base, target } of aliases) {
    if (request === base) {
      return originalResolve.call(moduleWithResolve, target, parent, isMain, options);
    }

    const prefix = `${base}/`;
    if (request.startsWith(prefix)) {
      const mapped = path.join(target, request.slice(prefix.length));
      return originalResolve.call(moduleWithResolve, mapped, parent, isMain, options);
    }
  }

  return originalResolve.call(moduleWithResolve, request, parent, isMain, options);
};
