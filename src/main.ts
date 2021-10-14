import * as core from '@actions/core';
import assert from 'assert';
import path from 'path';
import { buildDockerImage } from './heroku/build_docker_image';
import { loginToHeroku } from './heroku/login_to_heroku';
import { pushDockerContainer } from './heroku/push_docker_container';
import { releaseDockerContainer } from './heroku/release_docker_container';
import { assertDirExists, assertFileExists, getCwdFromPath } from './utils';

const DEFAULT_DOCKERFILE_NAME = 'Dockerfile';
const DEFAULT_PROCESS_TYPE = 'web';
const DEFAULT_DOCKER_OPTIONS = '';
const DEFAULT_DOCKER_CONTEXT = '.';

(async () => {
  try {
    const email = core.getInput('email', { required: true });
    const herokuApiKey = core.getInput('heroku_api_key', { required: true });
    const herokuAppName = core.getInput('heroku_app_name', { required: true });
    const dockerFileDirectory = core.getInput('dockerfile_directory', { required: true });
    const dockerfileName = core.getInput('dockerfile_name') || DEFAULT_DOCKERFILE_NAME;
    const dockerOptions = core.getInput('docker_options') || DEFAULT_DOCKER_OPTIONS;
    const processType = core.getInput('process_type') || DEFAULT_PROCESS_TYPE;
    const context = core.getInput('context') || DEFAULT_DOCKER_CONTEXT;

    assert(email, 'Missing required field: `email`.');
    assert(herokuApiKey, 'Missing required field: `heroku_api_key`.');
    assert(herokuAppName, 'Missing required field: `heroku_app_name`.');
    assert(dockerFileDirectory, 'Missing required field: `dockerfile_directory`.');

    // Create CWD that will be used by all commands
    const cwd = getCwdFromPath(dockerFileDirectory);
    assertDirExists(cwd);
    const dockerFilePath = path.join(dockerFileDirectory, dockerfileName);
    assertFileExists(dockerFilePath);

    const logged = await loginToHeroku({
      email,
      herokuApiKey,
      cwd,
    });
    if (!logged) return;

    const built = await buildDockerImage({
      dockerfileName,
      dockerOptions,
      herokuAppName,
      cwd,
      processType,
      context,
    });
    if (!built) return;

    const pushed = await pushDockerContainer({
      herokuApiKey,
      herokuAppName,
      cwd,
      processType,
    });
    if (!pushed) return;

    const released = await releaseDockerContainer({
      herokuApiKey,
      herokuAppName,
      cwd,
      processType,
    });
    if (!released) return;

    console.log('Successfully deployed! 💪 🚀');
  } catch (err) {
    core.setFailed(`Something goes wrong 😧.\nError: ${err.message}`);
  }
})();
