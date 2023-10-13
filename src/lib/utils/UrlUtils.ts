export function getProject(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname;// remove first slash
    }
    url = url?.substring(1);// remove first slash
    const firstSlash = url?.indexOf('/');
    if (firstSlash != -1 && url) {
        return decodeURI(url.substring(0, firstSlash));
    }
    return url ? decodeURI(url) : undefined;
}

function getVersionAndSpecification(url?: string) {
    const project = getProject(url);
    if (url && project) {
        const versionAndSpecification = url.substring(project.length + 2)// remove first slash
        let specification: string | undefined = undefined;
        let version = versionAndSpecification;
        if (versionAndSpecification) {
            const lastSlash = versionAndSpecification?.lastIndexOf('/');
            if (lastSlash != -1) {
                const potentialSpecification = versionAndSpecification?.substring(lastSlash)
                if (potentialSpecification?.endsWith('.yml') || potentialSpecification?.endsWith('.yaml')) {
                    version = versionAndSpecification?.substring(0, lastSlash)
                    specification = versionAndSpecification?.substring(lastSlash + 1)
                }
            }
        }
        return {
            version,
            specification
        };
    }
    return {};
}

export function getVersion(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname
    }
    const version = getVersionAndSpecification(url).version;
    return version ? decodeURI(version) : undefined;
}

export function getSpecification(url?: string) {
    if (typeof window !== 'undefined') {
        url = window.location.pathname
        console.log(url, url)
    }
    const specification = getVersionAndSpecification(url).specification;
    console.log(specification, specification)
    return specification ? decodeURI(specification) : undefined;
}