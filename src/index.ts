import { ModuleFilenameHelpers, Compiler, Compilation } from 'webpack';
import { TransformOptions, transform } from 'esbuild';

type Filter = string | RegExp;
type FilterObject = {
  include?: Filter | Filter[];
  exclude?: Filter | Filter[];
};

export type ESBuildPluginOptions = Omit<
  TransformOptions,
  'minify' | 'sourcemap' | 'sourcefile'
> &
  FilterObject;

const isJsFile = /\.js$/i;

export default class ESBuildPlugin {
  constructor(private readonly options: ESBuildPluginOptions = {}) {}
  async transformAssets(
    compilation: Compilation,
    assetNames: string[],
  ): Promise<void> {
    const {
      options: { devtool },
    } = compilation.compiler;

    const { SourceMapSource, RawSource } = compilation.compiler.webpack.sources;

    const sourcemap = !!(devtool && (devtool as string).includes('source-map'));

    const { include, exclude, ...transformOptions } = this.options;

    const transforms = assetNames
      .filter(
        (assetName) =>
          isJsFile.test(assetName) &&
          ModuleFilenameHelpers.matchObject({ include, exclude }, assetName),
      )
      .map(
        (assetName) => [assetName, compilation.getAsset(assetName)!] as const,
      )
      .map(async ([assetName, { info, source: assetSource }]) => {
        const { source, map } = assetSource.sourceAndMap();
        const result = await transform(source.toString(), {
          ...transformOptions,
          sourcemap,
          sourcefile: assetName,
        });

        compilation.updateAsset(
          assetName,
          sourcemap
            ? new SourceMapSource(
                result.code || '',
                assetName,
                result.map as any,
                source?.toString(),
                map!,
                true,
              )
            : new RawSource(result.code || ''),
          {
            ...info,
            minimized: true,
          },
        );
      });

    if (transforms.length > 0) {
      await Promise.all(transforms);
    }
  }

  apply(compiler: Compiler): void {
    const plugin = 'ESBuild Plugin';
    const meta = JSON.stringify({
      name: plugin,
      options: this.options,
    });

    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.hooks.chunkHash.tap(plugin, (_, hash) => hash.update(meta));
      compilation.hooks.processAssets.tapPromise(
        {
          name: plugin,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        async (assets) =>
          this.transformAssets(compilation, Object.keys(assets)),
      );
    });
  }
}
