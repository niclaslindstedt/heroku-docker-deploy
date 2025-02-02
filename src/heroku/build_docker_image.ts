import * as core from '@actions/core';
import { runCommand } from '../utils';

export const buildDockerImage = async ({
  dockerfileName,
  dockerOptions,
  herokuAppName,
  cwd,
  processType,
  context,
}: {
  dockerfileName: string;
  dockerOptions: string;
  herokuAppName: string;
  cwd: string;
  processType: string;
  context: string;
}): Promise<boolean> => {
  try {
    core.startGroup('Building docker container...');

    await runCommand(
      `docker build --file ${dockerfileName} ${dockerOptions} ` +
        `--tag registry.heroku.com/${herokuAppName}/${processType} ${context}`,
      { options: { cwd } },
    );
    console.log('Docker container built.');
    core.endGroup();
    return true;
  } catch (err) {
    core.endGroup();
    core.setFailed(`Building container failed.\nError: ${err.message}`);
    return false;
  }
};
