import { parse as parseYaml } from "yaml"

export const ErrorName = {
    MAX_FILE_SIZE_EXCEEDED: "MaxFileSizeExceededError",
    TIMEOUT: "TimeoutError",
    NOT_JSON_OR_YAML: "NotJsonOrYamlError",
}

export async function downloadFile(params: {
    url: URL;
    maxBytes: number;
    timeoutInSeconds: number;
    basicAuthUsername?: string;
    basicAuthPassword?: string;
}): Promise<string> {
    const { url, maxBytes, timeoutInSeconds, basicAuthUsername, basicAuthPassword } = params;
    const abortController = new AbortController();
    const timeoutSignal = AbortSignal.timeout(timeoutInSeconds * 1000);
    const headers: { [key: string]: string; } = {};
    if (basicAuthUsername && basicAuthPassword) {
        headers["Authorization"] = "Basic " + btoa(`${basicAuthUsername}:${basicAuthPassword}`);
    }
    // Make sure basic auth is removed from URL.
    const urlWithoutAuth = url;
    urlWithoutAuth.username = "";
    urlWithoutAuth.password = "";
    const response = await fetch(urlWithoutAuth, {
        method: "GET",
        headers,
        signal: AbortSignal.any([abortController.signal, timeoutSignal])
    });
    if (!response.body) {
        throw new Error("Response body unavailable");
    }
    let totalBytes = 0;
    let didExceedMaxBytes = false;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        totalBytes += value.length;
        chunks.push(value);
        if (totalBytes >= maxBytes) {
            didExceedMaxBytes = true;
            abortController.abort();
            break;
        }
    }
    if (didExceedMaxBytes) {
        const error = new Error("Maximum file size exceeded");
        error.name = ErrorName.MAX_FILE_SIZE_EXCEEDED;
        throw error;
    }
    const blob = new Blob(chunks);
    const arrayBuffer = await blob.arrayBuffer();
    const decoder = new TextDecoder();
    return decoder.decode(arrayBuffer);
}

export function checkIfJsonOrYaml(fileText: string) {
    try {
        parseYaml(fileText) // will also parse JSON as it is a subset of YAML
    } catch {
        const error = new Error("File is not JSON or YAML")
        error.name = ErrorName.NOT_JSON_OR_YAML
        throw error
    }
}
