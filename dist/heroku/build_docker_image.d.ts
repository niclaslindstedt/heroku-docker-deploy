export declare const buildDockerImage: ({ dockerfileName, dockerOptions, herokuAppName, cwd, processType, context, }: {
    dockerfileName: string;
    dockerOptions: string;
    herokuAppName: string;
    cwd: string;
    processType: string;
    context: string;
}) => Promise<boolean>;
