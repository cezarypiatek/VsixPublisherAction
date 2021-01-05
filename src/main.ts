import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as path from 'path'
import * as io from '@actions/io'
import {ExecOptions} from '@actions/exec/lib/interfaces'

const IS_WINDOWS = process.platform === 'win32'
const VS_VERSION = core.getInput('vs-version') || 'latest'
const VSWHERE_PATH = core.getInput('vswhere-path')
const PUBLISHER_ACCESS_TOKEN = core.getInput('personal-access-code')
const PUBLISH_MANIFEST_FILE = core.getInput('publish-manifest-file')
const EXTENSION_FILE = core.getInput('extension-file')

let VSWHERE_EXEC = '-products * -requires Microsoft.Component.MSBuild -property installationPath -latest '
if (VS_VERSION !== 'latest') {
  VSWHERE_EXEC += `-version "${VS_VERSION}" `
}

core.debug(`Execution arguments: ${VSWHERE_EXEC}`)

async function run(): Promise<void> {
  try {
    if (IS_WINDOWS === false) {
      core.setFailed('VSIX Publisher can only be run on Windows runners')
      return
    }

    // check to see if we are using a specific path for vswhere
    let vswhereToolExe = ''

    if (VSWHERE_PATH) {
      core.debug(`Using given vswhere-path: ${VSWHERE_PATH}`)
      vswhereToolExe = path.join(VSWHERE_PATH, 'vswhere.exe')
    } else {
      try {
        const vsWhereInPath: string = await io.which('vswhere', true)
        core.debug(`Found tool in PATH: ${vsWhereInPath}`)
        vswhereToolExe = vsWhereInPath
      } catch {
        vswhereToolExe = path.join(process.env['ProgramFiles(x86)'] as string, 'Microsoft Visual Studio\\Installer\\vswhere.exe')
        core.debug(`Trying Visual Studio-installed path: ${vswhereToolExe}`)
      }
    }

    if (!fs.existsSync(vswhereToolExe)) {
      core.setFailed('VSIX Publisher requires the path to where vswhere.exe exists' )
      return
    }

    let vsixPublisherPath = ''
    const vsWhereOptions: ExecOptions = {}
    vsWhereOptions.listeners = {
      stdout: (data: Buffer) => {
        const installationPath = data.toString().trim()
        core.debug(`Found installation path: ${installationPath}`)
        vsixPublisherPath = path.join(installationPath, 'VSSDK\\VisualStudioIntegration\\Tools\\Bin\\VsixPublisher.exe')
      }
    }

    await exec.exec(`"${vswhereToolExe}" ${VSWHERE_EXEC}`, [], vsWhereOptions)

    if (!vsixPublisherPath || !fs.existsSync(vsixPublisherPath)) {
      core.setFailed('Unable to find VsixPublisher')
      return
    }

    await exec.exec(`"${vsixPublisherPath}" publish -personalAccessToken ${PUBLISHER_ACCESS_TOKEN}  -payload ${EXTENSION_FILE} -publishManifest ${PUBLISH_MANIFEST_FILE}`)

  }
  catch (error)
  {
    core.setFailed(error.message)
  }
}

run()