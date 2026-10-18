const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const aliasPrefix = '@/';

function resolveAliasRequest(context, moduleName, platform) {
  const pathWithoutAlias = moduleName.slice(aliasPrefix.length);
  const resolvedPath = path.join(__dirname, 'src', pathWithoutAlias);
  return context.resolveRequest(
    { ...context, resolveRequest: undefined },
    resolvedPath,
    platform,
  );
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith(aliasPrefix)) {
        return resolveAliasRequest(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(__dirname), config), {
  input: './global.css',
  inlineRem: 16,
});
