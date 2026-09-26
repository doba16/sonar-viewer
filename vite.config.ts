import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from "vite-plugin-svgr"
import {licensePlugin} from "rolldown-license-plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), licensePlugin({
    done(deps, context) {
        context.emitFile({
          type: 'asset',
          fileName: "licenses.txt",
          source: deps.map(({name, version, license, licenseText}) => {
            return `${name}@${version} - ${license}\n${licenseText}`;
          }).join("\n\n"),
        });
      },
  })],
})
