import { series } from "gulp";
import { deleteAsync } from "del";
import { exec as processExec } from "child_process";

/**
 * Binds the standard output of the child process to the main process
 */
function exec(command) {
    const childProcess = processExec(command);

    childProcess.stdout?.on("data", console.info);
    childProcess.stderr?.on("data", console.error);

    return childProcess;
}

/**
 * Runs the specified command using the local node modules bin folder
 */
function npmExec(command) {
    const [executable, ...operands] = command.split(" ");

    return exec(`node_modules/.bin/${executable} ` + operands.join(" "));
}

/**
 * Remove all the generated files from the build
 */
export function clean() {
    return deleteAsync(["lib/**", "lib", "tsconfig.tsbuildinfo"], { force: true });
}

/**
 * Transpile the typescript code
 */
export function transpile() {
    return npmExec("tsc");
}

/**
 * Replace all aliases by the relative path
 */
export function convertPaths() {
    return npmExec("tscpaths -p tsconfig.json -s ./src -o ./lib/src");
}

/**
 * Build the project into the lib folder
 */
export const build = series(clean, transpile, convertPaths);
